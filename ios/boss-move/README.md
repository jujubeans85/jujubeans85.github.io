# BOSS · Move mode

Canonical deployment: https://jujubeans85.github.io/ios/boss-move/

Five-step, offline-capable moving checklist. The recipient is BOSS (she/her). Default target: 18 November 2026. Public source contains no private addresses, care records or contact details.

## Architecture

Buildless HTML/CSS/ES modules. The app is maintained in `ios/boss-move/` in the canonical Pages repository. A temporary `dist/` directory was used only for the build preview. No backend, tracking, dependencies at runtime, account or automated messaging. Browser localStorage is the working copy; exports are portable backups. Sharing sends an explicitly labelled snapshot in the URL fragment, not real-time collaborative state. Import requires confirmation and saves a recoverable previous copy.

The five fixed steps keep scope small. Notes, up to 20 item/from/to entries and target date are editable. Status supports not done, pending and done. Completion is reversible; confetti is rewarded once per step, respects reduced motion and can be disabled. Current achievements appear at the bottom. Sydney dates drive countdown, with no shame or negative countdown after the deadline.

## Reminders

Each step and the separate loose-ends notes section has a reminder control. It exports an RFC 5545 calendar event with DISPLAY alarm or copies a Siri request. No claim that a download or copied request is a scheduled alert. Import/confirm in Calendar or Siri is required; existing alerts must be edited there. A downloaded .ics may need to be sent to Mail and opened from its attachment on iPhone. This static app does not implement background push or native Reminders integration.

## iPhone

Safari → Share → Add to Home Screen. Keep Open as Web App enabled. First open requires network; subsequent cached app use works offline while device storage remains available. Home Screen and Safari storage can differ; transfer a backup/shared snapshot if needed. Clear browser data only after exporting a backup.

## Validation

Run `node --test ios/boss-move/tests/core.test.mjs` from the repository root. This validates Sydney date boundaries, state/rewards, import validation, Unicode sharing and calendar generation. Browser QA covers interaction and phone layout; a real iPhone is still required to verify installation and Calendar import/alert delivery.

Update the service worker cache version whenever app assets change. Never cache or remove another iOS app's caches. Do not publish private user-entered data into this repository.
