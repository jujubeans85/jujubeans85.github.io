import AVFoundation
import CryptoKit
import Foundation

struct ReviewState: Codable {
    var destination: String
}

enum Archive {
    static func savedURL(for session: CaptureSession) -> String? {
        guard let file = try? SessionStore.directory(session.id).appendingPathComponent("kept.json"),
              let data = try? Data(contentsOf: file),
              let state = try? JSONDecoder().decode(ReviewState.self, from: data) else { return nil }
        return state.destination
    }

    static func save(_ session: CaptureSession, bookmark: Data) async throws -> URL {
        guard !session.isLive else { throw KeptError.message("Stop the recording before keeping it.") }
        guard !session.parts.isEmpty else { throw KeptError.message("No finalized audio parts are available.") }
        let directory = try SessionStore.directory(session.id)
        let output = directory.appendingPathComponent("mix.m4a")
        // An interrupted export is never trusted as a complete mix.
        let receipt = directory.appendingPathComponent("export-complete.json")
        if !FileManager.default.fileExists(atPath: receipt.path) {
            try? FileManager.default.removeItem(at: output)
            let composition = AVMutableComposition()
            guard let track = composition.addMutableTrack(withMediaType: .audio,
                                                          preferredTrackID: kCMPersistentTrackID_Invalid) else {
                throw KeptError.message("Cannot prepare the mix.")
            }
            var cursor = CMTime.zero
            for name in session.parts.sorted() {
                let asset = AVURLAsset(url: directory.appendingPathComponent(name))
                guard let source = try await asset.loadTracks(withMediaType: .audio).first else {
                    throw KeptError.message("A recording part has no readable audio: \(name)")
                }
                let range = try await source.load(.timeRange)
                guard range.duration.seconds > 0 else { throw KeptError.message("Empty audio part: \(name)") }
                try track.insertTimeRange(range, of: source, at: cursor)
                cursor = cursor + range.duration
            }
            guard let exporter = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetAppleM4A) else {
                throw KeptError.message("Cannot create the M4A exporter.")
            }
            exporter.outputURL = output
            exporter.outputFileType = .m4a
            await exporter.export()
            guard exporter.status == .completed else {
                throw exporter.error ?? KeptError.message("Export interrupted. Your original parts are retained.")
            }
            try Data("complete".utf8).write(to: receipt, options: .atomic)
        }
        // Copying and verification stream from disk, independent of recording length.
        return try await Task.detached(priority: .userInitiated) {
            var stale = false
            let folder = try URL(resolvingBookmarkData: bookmark, options: [.withoutUI],
                                 relativeTo: nil, bookmarkDataIsStale: &stale)
            guard !stale, folder.startAccessingSecurityScopedResource() else {
                throw KeptError.message("Choose your KEPT folder again to renew access.")
            }
            defer { folder.stopAccessingSecurityScopedResource() }
            let destination = folder.appendingPathComponent("DJAY-\(session.id)", isDirectory: true)
            var coordinationError: NSError?
            var copyError: Error?
            NSFileCoordinator().coordinate(writingItemAt: destination, options: .forMerging,
                                            error: &coordinationError) { coordinated in
                do {
                    try FileManager.default.createDirectory(at: coordinated, withIntermediateDirectories: true)
                    let final = coordinated.appendingPathComponent("mix.m4a")
                    let sourceHash = try digest(output)
                    let existingHash = FileManager.default.fileExists(atPath: final.path) ? try digest(final) : nil
                    if existingHash != sourceHash {
                        let temporary = coordinated.appendingPathComponent("mix-uploading.m4a")
                        try? FileManager.default.removeItem(at: temporary)
                        try FileManager.default.copyItem(at: output, to: temporary)
                        guard try digest(temporary) == sourceHash else {
                            throw KeptError.message("Saved copy verification failed. Local audio retained.")
                        }
                        if FileManager.default.fileExists(atPath: final.path) {
                            _ = try FileManager.default.replaceItemAt(final, withItemAt: temporary)
                        } else {
                            try FileManager.default.moveItem(at: temporary, to: final)
                        }
                    }
                    try JSONEncoder().encode(session).write(to: coordinated.appendingPathComponent("session.json"), options: .atomic)
                    let state = ReviewState(destination: final.path)
                    try JSONEncoder().encode(state).write(to: directory.appendingPathComponent("kept.json"), options: .atomic)
                } catch { copyError = error }
            }
            if let error = coordinationError ?? (copyError as NSError?) { throw error }
            return destination.appendingPathComponent("mix.m4a")
        }.value
    }

    private static func digest(_ url: URL) throws -> SHA256.Digest {
        let file = try FileHandle(forReadingFrom: url)
        defer { try? file.close() }
        var hash = SHA256()
        while let data = try file.read(upToCount: 1024 * 1024), !data.isEmpty { hash.update(data: data) }
        return hash.finalize()
    }
}
