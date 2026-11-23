import Foundation

struct CaptureSession: Codable, Identifiable {
    var id: String
    var started: Date
    var heartbeat: Date
    var state: String
    var reason: String
    var parts: [String]

    var isLive: Bool { state == "recording" && Date().timeIntervalSince(heartbeat) < 30 }
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
