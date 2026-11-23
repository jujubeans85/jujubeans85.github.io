# DJAY Kept

Native iPhone/iPad companion with a ReplayKit broadcast upload extension. Source implementation, pending signed-device validation. This app captures the DJ audio as M4A. Screen video is omitted to keep long sets practical. It can also import a screen recording from Photos and extract its audio when kept.

## Install on a Mac

1. Install Xcode and XcodeGen (`brew install xcodegen`).
2. In this directory run `xcodegen generate`, then open `DjayKept.xcodeproj`. Alternatively double-click `START_DJAY_KEPT.command` after installing the prerequisites.
3. Select your Apple development team for DjayKept and KeptBroadcast. App Groups must be available on that team. Apple's free Personal Team does not provide every capability needed here. Do not purchase a membership just to try this without first checking your existing access.
4. If the bundle IDs are unavailable, change the two `PRODUCT_BUNDLE_IDENTIFIER` values in `project.yml` together. The broadcast ID must equal the app ID plus `.broadcast`. Change `APP_GROUP` to a group registered to your team. Regenerate and select that same group for both targets.
5. Connect your iPad, enable Developer Mode if Xcode requests it, select the device and Run the DjayKept scheme.
6. In DJAY Kept choose the existing `iCloud Drive / CRATE JUICE / DJAY / KEPT` folder. Grant notifications.
7. Tap the system Record control, confirm Start Broadcast and switch to djay. This consent step is required for each capture. The app does not configure an App Opened automation or silently start capture.

A website or unsigned ZIP cannot install the ReplayKit extension. Installation and signing require Xcode/device access that this chat does not have.

## Behavior

- ReplayKit `.audioApp` samples are encoded as 192 kbps AAC M4A. Microphone samples and video are ignored. App audio may include any app playing sound during the broadcast. Confirm djay's source actually supplies audio on your device.
- A monotonic five-minute timer resets whenever PCM RMS exceeds -60 dBFS. Silent buffers and absent app-audio callbacks both advance the timeout. A capture failure can therefore finish a session too, and is explicitly reported. Music has no time limit. Very quiet music below the threshold can finish a recording early.
- Files finalize in ten-minute parts to limit loss if iPadOS kills the extension. Parts are ordered in the session manifest. An OS file lock prevents Keep/Delete while the extension owns the session and is released automatically on process death. At most the current unfinished part is at risk on termination. Recording interruptions and format changes need device testing. Encoders that cannot keep up terminate with an error instead of silently skipping buffers.
- On timeout the extension finalizes audio, queues a review notification and calls ReplayKit's public `finishBroadcastWithError` termination API. iPadOS may show a broadcast-stopped error banner. The banner text directs the user back to review their audio. This behavior needs device validation.
- The notification opens the persistent Keep/Delete inbox. Notifications require authorization and can be suppressed by Focus. Pending recordings remain in the inbox even if notifications are unavailable or unanswered.
- Listen plays the finalized parts. Keep joins them to one `mix.m4a`, copies it into a unique session folder under the chosen KEPT folder, verifies SHA-256 with bounded disk reads and records a receipt. The last five minutes of silence are retained. Copying is idempotent and retries repair partial transfers.
- iCloud transfer occurs after Keep while the app is active. Its file-provider upload continues as connectivity allows. A verified local file-provider copy does not establish cloud-server upload completion. If the app is suspended during export/copy, reopen it and retry Keep. Original parts remain locally until the user explicitly removes them.
- Delete removes only this app's staged session after confirmation. Kept iCloud copies and originals in Photos are retained. No response causes no deletion.
- Screen recordings made with the ordinary Photos screen-recorder destination continue to land in Photos. Use Import for those. Live silence detection applies only when using the DJAY Kept broadcast extension.
- Existing Sunday reminders continue separately. CSV export remains djay's manual export/share step. Save each CSV in the corresponding session folder using Files.

## Validation

The first GitHub macOS build and simulator silence tests passed on 24 November 2026 Sydney time. The subsequent capture-lock change adds a regression test and must pass the latest workflow before merging. Physical-device testing remains pending.

The GitHub workflow generates the project, builds the app and extension and runs the Swift silence regression tests on an iOS simulator without signing. A simulator build cannot prove system capture works on iPad.

Before relying on this app for a set, test on the actual iPad:

1. Music for one minute, then silence for 4m59s, resume. It must continue.
2. Stop music for a full five minutes. The recording must finish, notify and remain playable in the inbox.
3. Keep into the existing KEPT folder. Play the resulting M4A in Files. Retry Keep and confirm it uses the same session folder.
4. Deny folder access or disconnect networking. A save error must preserve all staged audio. Reconnect and retry.
5. Delete a disposable test. Confirm only that staged session is removed.
6. Import the existing screen recording from Photos. Listen, Keep and verify the extracted M4A.
7. Run music for at least 130 minutes. Check start/end, every ten-minute boundary, audio routes and interruptions. Test available storage, lock behavior and extension stability. There is no configured duration ceiling, but two-hour operation remains unverified until this passes.

Estimated AAC storage is roughly 173 MB per two hours, with additional temporary space for the assembled output and provider copy. Imported videos can be substantially larger.

Apple references:
- https://developer.apple.com/documentation/replaykit/rpbroadcastsamplehandler
- https://developer.apple.com/documentation/replaykit/rpsystembroadcastpickerview
- https://developer.apple.com/documentation/uikit/providing-access-to-directories
- https://developer.apple.com/documentation/usernotifications/declaring-your-actionable-notification-types
