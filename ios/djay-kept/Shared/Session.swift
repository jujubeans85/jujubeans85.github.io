import Foundation
import Darwin

struct CaptureSession: Codable, Identifiable {
    var id: String
    var started: Date
    var heartbeat: Date
    var state: String
    var reason: String
    var parts: [String]

    var isLive: Bool {
        // The OS releases this lock if the extension dies. A stale heartbeat alone
        // must never authorize deleting audio owned by a running extension.
        if let folder = try? SessionStore.directory(id),
           let held = CaptureLease.isHeld(in: folder) { return held }
        return state == "recording" && Date().timeIntervalSince(heartbeat) < 30
    }
}

enum KeptError: LocalizedError {
    case message(String)
    var errorDescription: String? {
        switch self { case .message(let message): return message }
    }
}

enum SessionStore {
    static var root: URL {
        get throws {
            guard let group = Bundle.main.object(forInfoDictionaryKey: "AppGroupIdentifier") as? String,
                  let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: group) else {
                throw KeptError.message("App Group unavailable. Check signing for both targets.")
            }
            let url = container.appendingPathComponent("Sessions", isDirectory: true)
            try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
            return url
        }
    }

    static func directory(_ id: String) throws -> URL {
        guard UUID(uuidString: id) != nil else { throw KeptError.message("Invalid session identifier.") }
        return try root.appendingPathComponent(id, isDirectory: true)
    }

    static func write(_ session: CaptureSession) throws {
        let folder = try directory(session.id)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        try JSONEncoder().encode(session).write(to: folder.appendingPathComponent("session.json"), options: .atomic)
    }

    static func read(_ id: String) throws -> CaptureSession {
        try JSONDecoder().decode(CaptureSession.self, from: Data(contentsOf: directory(id).appendingPathComponent("session.json")))
    }

    static func sessions() throws -> [CaptureSession] {
        try FileManager.default.contentsOfDirectory(at: root, includingPropertiesForKeys: nil)
            .compactMap { try? read($0.lastPathComponent) }
            .sorted { $0.started > $1.started }
    }
}

final class CaptureLease {
    private let descriptor: Int32

    init(folder: URL) throws {
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        let path = folder.appendingPathComponent(".capture-lock").path
        descriptor = Darwin.open(path, O_CREAT | O_RDWR, S_IRUSR | S_IWUSR)
        guard descriptor >= 0 else { throw KeptError.message("Cannot create capture lock.") }
        guard flock(descriptor, LOCK_EX | LOCK_NB) == 0 else {
            Darwin.close(descriptor)
            throw KeptError.message("This recording is already active.")
        }
    }

    deinit {
        flock(descriptor, LOCK_UN)
        Darwin.close(descriptor)
    }

    static func isHeld(in folder: URL) -> Bool? {
        let descriptor = Darwin.open(folder.appendingPathComponent(".capture-lock").path, O_RDONLY)
        guard descriptor >= 0 else { return nil }
        defer { Darwin.close(descriptor) }
        if flock(descriptor, LOCK_SH | LOCK_NB) == 0 {
            flock(descriptor, LOCK_UN)
            return false
        }
        return true
    }
}
