import ReplayKit
import AVFoundation
import UserNotifications

final class SampleHandler: RPBroadcastSampleHandler {
    private let queue = DispatchQueue(label: "com.cratejuice.kept.capture")
    private let finishing = DispatchGroup()
    private var session: CaptureSession?
    private var gate = SilenceGate(start: ProcessInfo.processInfo.systemUptime)
    private var timer: DispatchSourceTimer?
    private var writer: AVAssetWriter?
    private var input: AVAssetWriterInput?
    private var partStart = CMTime.invalid
    private var partNumber = 0
    private var closing = false
    private var lastHeartbeat: TimeInterval = 0
    private var captureFormat: AudioStreamBasicDescription?

    override func broadcastStarted(withSetupInfo setupInfo: [String: NSObject]?) {
        queue.sync {
            do {
                let now = Date()
                session = CaptureSession(id: UUID().uuidString, started: now, heartbeat: now,
                                         state: "recording", reason: "", parts: [])
                try SessionStore.write(session!)
                gate = SilenceGate(start: ProcessInfo.processInfo.systemUptime)
                let timer = DispatchSource.makeTimerSource(queue: queue)
                timer.schedule(deadline: .now() + 1, repeating: 1)
                timer.setEventHandler { [weak self] in self?.tick() }
                self.timer = timer
                timer.resume()
            } catch { stop(reason: error.localizedDescription, terminate: true) }
        }
    }

    override func processSampleBuffer(_ sampleBuffer: CMSampleBuffer, with sampleBufferType: RPSampleBufferType) {
        guard sampleBufferType == .audioApp else { return }
        // Synchronous handoff bounds retained buffers. ReplayKit serializes callbacks.
        queue.sync {
            guard !closing, session != nil, CMSampleBufferDataIsReady(sampleBuffer) else { return }
            do {
                gate.observe(db: try PCMLevel.decibels(sampleBuffer), at: ProcessInfo.processInfo.systemUptime)
                guard let description = CMSampleBufferGetFormatDescription(sampleBuffer),
                      let format = CMAudioFormatDescriptionGetStreamBasicDescription(description)?.pointee else {
                    throw KeptError.message("Missing capture audio format.")
                }
                let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
                guard pts.isValid, pts.isNumeric else { throw KeptError.message("Invalid audio timestamp.") }
                if let previous = captureFormat,
                   previous.mSampleRate != format.mSampleRate || previous.mChannelsPerFrame != format.mChannelsPerFrame {
                    closePart()
                }
                if partStart.isValid && CMTimeGetSeconds(pts - partStart) >= 600 { closePart() }
                if writer == nil { try beginPart(at: pts, format: format, description: description) }
                guard let input, input.isReadyForMoreMediaData, input.append(sampleBuffer) else {
                    throw writer?.error ?? KeptError.message("Audio encoder could not keep up. Review saved parts.")
                }
            } catch { stop(reason: error.localizedDescription, terminate: true) }
        }
    }

    private func beginPart(at time: CMTime, format: AudioStreamBasicDescription,
                           description: CMFormatDescription) throws {
        guard let session else { return }
        partNumber += 1
        let url = try SessionStore.directory(session.id)
            .appendingPathComponent(String(format: "part-%04d.m4a", partNumber))
        let writer = try AVAssetWriter(outputURL: url, fileType: .m4a)
        let input = AVAssetWriterInput(mediaType: .audio, outputSettings: [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            AVSampleRateKey: format.mSampleRate,
            AVNumberOfChannelsKey: format.mChannelsPerFrame,
            AVEncoderBitRateKey: 192000
        ], sourceFormatHint: description)
        input.expectsMediaDataInRealTime = true
        guard writer.canAdd(input) else { throw KeptError.message("Cannot configure the audio encoder.") }
        writer.add(input)
        guard writer.startWriting() else { throw writer.error ?? KeptError.message("Cannot start recording.") }
        writer.startSession(atSourceTime: time)
        self.writer = writer
        self.input = input
        self.partStart = time
        self.captureFormat = format
    }

    private func closePart() {
        guard let writer, let input else { return }
        self.writer = nil
        self.input = nil
        partStart = .invalid
        input.markAsFinished()
        finishing.enter()
        writer.finishWriting { [weak self] in
            guard let self else { return }
            self.queue.async {
                defer { self.finishing.leave() }
                guard writer.status == .completed else {
                    self.session?.reason = writer.error?.localizedDescription ?? "A recording part failed to finalize."
                    return
                }
                self.session?.parts.append(writer.outputURL.lastPathComponent)
                if let session = self.session { try? SessionStore.write(session) }
            }
        }
    }

    private func tick() {
        guard !closing else { return }
        let now = ProcessInfo.processInfo.systemUptime
        if gate.shouldStop(at: now) {
            stop(reason: "Five minutes of silence or unavailable app audio.", terminate: true)
            return
        }
        if now - lastHeartbeat >= 5 {
            session?.heartbeat = Date()
            if let session { try? SessionStore.write(session) }
            lastHeartbeat = now
        }
    }

    private func stop(reason: String, terminate: Bool) {
        guard !closing else { return }
        closing = true
        timer?.cancel()
        timer = nil
        session?.reason = reason
        closePart()
        finishing.notify(queue: queue) { [weak self] in
            guard let self else { return }
            self.session?.state = "review"
            self.session?.heartbeat = Date()
            do {
                if let session = self.session {
                    try SessionStore.write(session)
                    let content = UNMutableNotificationContent()
                    content.title = "Review your djay recording"
                    content.body = "Open DJAY Kept to listen, keep or delete."
                    content.categoryIdentifier = "KEPT_REVIEW"
                    content.userInfo = ["sessionID": session.id]
                    content.sound = .default
                    UNUserNotificationCenter.current().add(UNNotificationRequest(
                        identifier: session.id, content: content, trigger: nil))
                }
            } catch { self.session?.reason = error.localizedDescription }
            if terminate {
                // ReplayKit exposes error termination to upload extensions. iPadOS may show
                // a stopped-broadcast banner. The finalized local audio remains available.
                self.finishBroadcastWithError(KeptError.message("Recording stopped. Open DJAY Kept to review it. \(reason)"))
            }
        }
    }

    override func broadcastFinished() {
        queue.sync { stop(reason: "Stopped from Control Centre.", terminate: false) }
    }

    override func broadcastPaused() {
        queue.sync { stop(reason: "Capture paused. Review the recording before starting a new session.", terminate: true) }
    }
}
