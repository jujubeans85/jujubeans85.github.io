import SwiftUI
import ReplayKit
import AVKit
import PhotosUI
import UniformTypeIdentifiers
import UserNotifications

@main
struct DjayKeptApp: App {
    @UIApplicationDelegateAdaptor(NotificationDelegate.self) var notifications
    var body: some Scene { WindowGroup { RecorderView() } }
}

final class NotificationDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        center.setNotificationCategories([UNNotificationCategory(identifier: "KEPT_REVIEW", actions: [
            UNNotificationAction(identifier: "REVIEW", title: "Keep / Delete", options: .foreground)
        ], intentIdentifiers: [])])
        return true
    }
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound])
    }
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        // Foreground action opens the persistent inbox. Destruction requires an explicit confirmation there.
        completionHandler()
    }
}

struct BroadcastButton: UIViewRepresentable {
    func makeUIView(context: Context) -> RPSystemBroadcastPickerView {
        let view = RPSystemBroadcastPickerView(frame: CGRect(x: 0, y: 0, width: 60, height: 60))
        view.preferredExtension = (Bundle.main.bundleIdentifier ?? "com.cratejuice.djaykept") + ".broadcast"
        view.showsMicrophoneButton = false
        return view
    }
    func updateUIView(_ uiView: RPSystemBroadcastPickerView, context: Context) {}
}

struct PhotosImport: UIViewControllerRepresentable {
    var completed: (Result<URL, Error>) -> Void
    func makeCoordinator() -> Coordinator { Coordinator(completed) }
    func makeUIViewController(context: Context) -> PHPickerViewController {
        var configuration = PHPickerConfiguration()
        configuration.filter = .videos
        configuration.selectionLimit = 1
        let picker = PHPickerViewController(configuration: configuration)
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}
    final class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let completed: (Result<URL, Error>) -> Void
        init(_ completed: @escaping (Result<URL, Error>) -> Void) { self.completed = completed }
        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            picker.dismiss(animated: true)
            guard let item = results.first else { return }
            item.itemProvider.loadFileRepresentation(forTypeIdentifier: UTType.movie.identifier) { url, error in
                let result: Result<URL, Error> = Result {
                    guard let url else { throw error ?? KeptError.message("Could not load the video.") }
                    let session = CaptureSession(id: UUID().uuidString, started: Date(), heartbeat: Date(),
                                                 state: "review", reason: "Imported screen recording. Audio will be extracted when kept.",
                                                 parts: ["part-0001.mov"])
                    let folder = try SessionStore.directory(session.id)
                    try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
                    // Copy while the item provider's temporary URL is still valid. No whole-video Data allocation.
                    try FileManager.default.copyItem(at: url, to: folder.appendingPathComponent("part-0001.mov"))
                    try SessionStore.write(session)
                    return folder
                }
                DispatchQueue.main.async { self.completed(result) }
            }
        }
    }
}

struct RecorderView: View {
    @Environment(\.scenePhase) private var scenePhase
    @AppStorage("keptFolderBookmark") private var bookmark = Data()
    @AppStorage("keptFolderName") private var folderName = "Choose iCloud Drive / CRATE JUICE / DJAY / KEPT"
    @State private var sessions: [CaptureSession] = []
    @State private var chooseFolder = false
    @State private var importPhoto = false
    @State private var deleteSession: CaptureSession?
    @State private var busy = false
    @State private var message = ""
    @State private var player: AVQueuePlayer?
    @State private var showPlayer = false
    private let refreshTimer = Timer.publish(every: 5, on: .main, in: .common).autoconnect()

    var body: some View {
        NavigationStack {
            List {
                Section("Record") {
                    HStack {
                        BroadcastButton().frame(width: 60, height: 60)
                        Text("Tap Record, confirm Start Broadcast, then open djay.")
                    }
                    Text("DJ audio • five-minute silence stop • no session time limit")
                        .font(.footnote).foregroundStyle(.secondary)
                    Text("The system captures app audio while broadcasting. Stop before opening other apps that play sound.")
                        .font(.footnote).foregroundStyle(.secondary)
                    Button("Import an existing screen recording") { importPhoto = true }
                }
                Section("Save destination") {
                    Button(folderName) { chooseFolder = true }
                    Text("Keep saves the M4A here. iCloud finishes uploading when connectivity permits. Local audio stays available until you remove it.")
                        .font(.footnote).foregroundStyle(.secondary)
                }
                if !message.isEmpty { Text(message).foregroundStyle(.orange) }
                Section("Recordings") {
                    if sessions.isEmpty { Text("Recordings awaiting your decision appear here.") }
                    ForEach(sessions) { session in
                        VStack(alignment: .leading, spacing: 10) {
                            Text(session.started.formatted(date: .abbreviated, time: .shortened)).font(.headline)
                            Text(status(session)).font(.subheadline)
                            if !session.reason.isEmpty { Text(session.reason).font(.caption).foregroundStyle(.secondary) }
                            if !session.isLive {
                                HStack(spacing: 24) {
                                    Button("Listen") { listen(session) }.disabled(session.parts.isEmpty)
                                    Button(Archive.savedURL(for: session) == nil ? "Keep" : "Save again") {
                                        Task { await keep(session) }
                                    }.disabled(bookmark.isEmpty || session.parts.isEmpty)
                                    Button(Archive.savedURL(for: session) == nil ? "Delete" : "Remove local copy", role: .destructive) {
                                        deleteSession = session
                                    }
                                }.buttonStyle(.borderless).disabled(busy)
                            }
                        }.padding(.vertical, 6)
                    }
                }
            }
            .navigationTitle("DJAY Kept")
            .overlay { if busy { ProgressView("Saving…").padding(30).background(.regularMaterial).clipShape(RoundedRectangle(cornerRadius: 16)) } }
            .fileImporter(isPresented: $chooseFolder, allowedContentTypes: [.folder]) { result in
                do {
                    let folder = try result.get()
                    guard folder.startAccessingSecurityScopedResource() else { throw KeptError.message("Folder access was denied.") }
                    defer { folder.stopAccessingSecurityScopedResource() }
                    bookmark = try folder.bookmarkData(options: .minimalBookmark, includingResourceValuesForKeys: nil, relativeTo: nil)
                    folderName = folder.lastPathComponent
                    message = "Folder connected. Tap Keep on a recording to save it here."
                } catch { message = error.localizedDescription }
            }
            .sheet(isPresented: $importPhoto) {
                PhotosImport { result in
                    if case .failure(let error) = result { message = error.localizedDescription }
                    importPhoto = false
                    refresh()
                }
            }
            .sheet(isPresented: $showPlayer, onDismiss: { player?.pause(); player = nil }) {
                VideoPlayer(player: player).onAppear { player?.play() }
            }
            .confirmationDialog("Delete this local recording?", isPresented: Binding(
                get: { deleteSession != nil }, set: { if !$0 { deleteSession = nil } })) {
                Button("Delete local recording", role: .destructive) {
                    guard let session = deleteSession else { return }
                    do {
                        guard !(try SessionStore.read(session.id)).isLive else { throw KeptError.message("This recording is still active.") }
                        try FileManager.default.removeItem(at: SessionStore.directory(session.id))
                        refresh()
                    } catch { message = error.localizedDescription }
                    deleteSession = nil
                }
            } message: {
                Text("Saved iCloud copies and the original video in Photos are retained.")
            }
            .task {
                refresh()
                do { _ = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) }
                catch { message = "Notifications unavailable. Return here after recording to review it." }
            }
            .onReceive(refreshTimer) { _ in if !busy { refresh() } }
            .onChange(of: scenePhase) { _, phase in if phase == .active { refresh() } }
        }
    }

    private func status(_ session: CaptureSession) -> String {
        if session.isLive { return "Recording — \(session.parts.count) finalized parts" }
        if Archive.savedURL(for: session) != nil { return "Saved to chosen folder • local copy retained" }
        if session.state == "recording" { return "Interrupted capture • \(session.parts.count) recoverable parts" }
        return "Awaiting Keep / Delete • \(session.parts.count) parts"
    }

    private func refresh() {
        do { sessions = try SessionStore.sessions() }
        catch { message = error.localizedDescription }
    }

    private func listen(_ session: CaptureSession) {
        do {
            let directory = try SessionStore.directory(session.id)
            player = AVQueuePlayer(items: session.parts.sorted().map { AVPlayerItem(url: directory.appendingPathComponent($0)) })
            showPlayer = true
        } catch { message = error.localizedDescription }
    }

    @MainActor private func keep(_ session: CaptureSession) async {
        guard !busy else { return }
        busy = true
        defer { busy = false; refresh() }
        do {
            let latest = try SessionStore.read(session.id)
            let url = try await Archive.save(latest, bookmark: bookmark)
            message = "Saved \(url.lastPathComponent) in \(url.deletingLastPathComponent().lastPathComponent). You can add its history CSV in Files."
        } catch { message = error.localizedDescription }
    }
}
