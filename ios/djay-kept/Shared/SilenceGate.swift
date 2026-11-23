import Foundation

/// Uses monotonic time so clock corrections cannot finish a set early.
struct SilenceGate {
    let timeout: TimeInterval
    let thresholdDB: Double
    private(set) var lastSound: TimeInterval

    init(start: TimeInterval, timeout: TimeInterval = 300, thresholdDB: Double = -60) {
        self.timeout = timeout
        self.thresholdDB = thresholdDB
        self.lastSound = start
    }

    mutating func observe(db: Double, at time: TimeInterval) {
        if db.isFinite && db > thresholdDB { lastSound = time }
    }

    func shouldStop(at time: TimeInterval) -> Bool {
        time - lastSound >= timeout
    }
}
