import XCTest
@testable import DjayKept

final class SilenceGateTests: XCTestCase {
    func testTwoHourSessionDoesNotTimeOutWhileMusicPlays() {
        var gate = SilenceGate(start: 0)
        for second in 0...10800 {
            gate.observe(db: -20, at: Double(second))
            XCTAssertFalse(gate.shouldStop(at: Double(second)))
        }
        XCTAssertFalse(gate.shouldStop(at: 11099))
        XCTAssertTrue(gate.shouldStop(at: 11100))
    }
    func testSoundResetsContinuousSilence() {
        var gate = SilenceGate(start: 10)
        gate.observe(db: -70, at: 309)
        XCTAssertFalse(gate.shouldStop(at: 309))
        gate.observe(db: -30, at: 309)
        XCTAssertFalse(gate.shouldStop(at: 608))
        XCTAssertTrue(gate.shouldStop(at: 609))
    }
    func testNoAudioTimesOutAndInvalidLevelsDoNotReset() {
        var gate = SilenceGate(start: 50)
        gate.observe(db: .nan, at: 349)
        gate.observe(db: -.infinity, at: 349)
        XCTAssertTrue(gate.shouldStop(at: 350))
    }
}
