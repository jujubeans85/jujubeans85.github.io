# Clobo’s Freedom — recovery and unpublished repair

Recovered on 6 November 2026 from `jujubeans85/jujubeans85.github.io`, base commit `0afcb53d1af5b8284020085f71b999019e0c3b8c`.

Existing public app: https://jujubeans85.github.io/clobo/

The existing app, pink heart identity, 28 daily notes, calendar, dated SMS JSON, and exact `LUV YA !😀💛` sign-off are preserved. `chlomim` and Cans are not modified. No root page or other application is changed. The original files remain available in Git history; recovered source blobs were verified by their Git SHA-1 hashes.

## Proposed behavior

- Before 27 November: the existing countdown and daily note.
- At midnight on 27 November in Australia/Sydney: “Today’s your day, Clobo.” The countdown continues to the existing 5 pm finish.
- At 5 pm: “You did it, Clobo. No countdown now. Go live.” The clock stays at zero after the finish.
- The user-triggered celebration keeps the heart, confetti and short melody. No automatic sound. Reduced-motion preference suppresses confetti and animated heart/ECG.
- Installation instructions work even when local storage is blocked. An old stored “installed” flag can no longer disable the install button.
- A new `/clobo/` worker saves only Clobo’s shell, icons, notes and calendar. A complete cached version can start without the network after its first successful online load. If storage is cleared or evicted, open online again. External fact-check pages and calendar subscription services still require a network.
- `Ready offline` appears only after a worker activates. Saving failure is shown as a failure. A new version waits for current app windows to close; bump the worker cache version when changing cached files.
- The manifest's explicit `id` preserves its former implicit identity (`/clobo/index.html`). Start URL, scope and icons stay within `/clobo/`.

## Install on iPhone

1. Open the existing Clobo link in Safari.
2. Tap Share → Add to Home Screen. If Share is inside the page menu, open that first.
3. Leave **Open as Web App** on, then tap **Add**.
4. Open **Clobo** from its new icon.
5. **After this repair is approved and published:** open it once online and wait for **Ready offline**. Turn on Airplane Mode, close and reopen Clobo, and check that the countdown and notes still work.

The current live version can be added to the Home Screen, but it has no service worker and should not be represented as reliably available offline.

Apple instructions: https://support.apple.com/en-au/guide/iphone/iphea86e5236/ios

## Review locally

Run `python3 -m http.server 8000` in the repository root, then open `http://localhost:8000/clobo/`. HTTPS is required for a remotely hosted installation; localhost is sufficient for development. Opening `index.html` as a file previews the UI but cannot register a service worker.

`tests/build-preview.py` generates `Clobo_Freedom_Review.html`, a self-contained visual review with fixed-date countdown, final-day and celebration views, plus browser checks at 320, 375, 390, 430, 768 and 1024 px. Open the generated HTML in a normal browser. It is a review artifact, not an installable PWA. It contains embedded copies of the actual application scripts and styles; it is not a separately maintained application.

## Verification recorded in this environment

PASS: `node --test clobo/tests/core.cjs` — 10 tests cover known countdown values; equivalent instants; Sydney midnight; the exact 5 pm boundary; no early zero or negative values; daylight saving; all 28 notes; exact sign-off; offline worker cache routes and required assets; failed installation; cache isolation; and manifest identity.

PASS: JavaScript syntax checks and Git whitespace check. The current live app was opened and its existing rendered state/sign-off observed. Its source has no service worker registration.

LIMIT: Offline tests run the production worker handlers with a controlled Cache/Fetch environment. They are not a real browser offline-relaunch test. The automated cloud browser refused localhost access and blocks local file previews. A local browser binary could not be installed in this environment. Therefore the generated visual browser checks, actual offline relaunch, native Add to Home Screen flow and Safari device layout remain unverified. Do not mark these as passed based on the test harness alone.

## Before publishing

Review the generated preview. Run its browser checks and check the page in iPhone Safari. On an HTTPS staging copy, load online, wait for Ready offline, disconnect, relaunch both `/clobo/` and `/clobo/index.html`, verify the daily notes and calendar file, and confirm another app’s caches survive. Check a failed initial download does not show Ready offline. Confirm transition at Sydney midnight and the preserved 5 pm finish. Publish only after user review/approval. Do not merge this draft as part of recovery.
