# Batch 02 · 18 September 2026

Three repository repairs/shared-component changes published to main, following registry stages 4–5. This completes the bounded source batch, not every approved action in those stages or the 43-repository overhaul.

## Published changes

| Repository | Published commit | Previous main / rollback baseline | Pages deployment |
|---|---|---|---|
| COCKATOO | [69fc0f8938](https://github.com/jujubeans85/COCKATOO/commit/69fc0f89386a9c5858674d5ff4349499f41d64e9) | `8ff4a90d712aebaa74d5dc447441833123a8513d` | [Passed](https://github.com/jujubeans85/COCKATOO/actions/runs/35359348104) |
| Juicemoments | [536f785034](https://github.com/jujubeans85/Juicemoments/commit/536f785034e766883f264c0f8b7fe134c1d90d14) | `58149a88a9a20803b111d3f75c3a21d41ee02f4e` | [Passed](https://github.com/jujubeans85/Juicemoments/actions/runs/35359352134) |
| personal-sonic-postcards | [c84176153d](https://github.com/jujubeans85/personal-sonic-postcards/commit/c84176153d583b21cbf52658e5da3677daeb3167) | `07394c491d2fe61d1f5a0d5c444a2dea6bb50079` | [Passed](https://github.com/jujubeans85/personal-sonic-postcards/actions/runs/35359359081) |

Each repository and the portfolio index has `rollback/batch-02-2026-09-18` retaining its previous main tip. The portfolio index baseline is `c799236f61c3b5361836a1a35b934de1f406c605`. All updates were fast-forward only; main was rechecked immediately before publication.

### COCKATOO

- Fixed lowercase asset references in app rendering, offline-media lists and tour data to match existing `ASSETS/` paths.
- Scoped shell/media cache names to the service-worker registration URL; lookup and cleanup cannot consume/delete another app's caches.
- Kept older unscoped caches because their ownership on a shared origin cannot be proven.
- Updates wait for the existing Update button or the normal worker lifecycle. Existing sessions are not automatically claimed/reloaded.
- Navigation responses are cached by request; only home navigations refresh the home fallback. Other pages cannot replace the offline home.
- Offline-save errors no longer assert the shell was cached.

### Juicemoments

- Fixed `m/chloe-coffee.html` to resolve inside the app under both repository-prefix and root hosting.
- Gift registry selection requires an own key. Destinations require HTTP(S); delay is finite and bounded.
- Repeat taps schedule one navigation. Haptic failure cannot block delivery. Modified clicks retain normal link behavior.
- Recipient JSON, destination, images and both birthday routes are untouched. No redemption request was made.

### personal-sonic-postcards

- Added one local `shared/nfc-transport.js`, consumed by the main Cinema demo and the ESM NFC manager.
- Registered reading handlers before scanning; successful/failed/timed-out scans stop and release handlers.
- Corrected writing to use `NDEFReader.write`; explicit unsupported-device simulations retain a simulated marker.
- Kept public wrapper signatures/profile counter keys; the ESM counter tolerates unavailable or malformed storage.
- Audio processing, Character Engine behavior, V4 demo, visualizer routes and recipient profiles are untouched.
- Historical root `nfc-manager.js` is retained but not loaded by the active demo; it remains unmigrated. This is a partial shared-component consolidation, not a blanket completion claim.

## Verification

- 11 Node regression tests passed across the three repositories. Tests are committed at `tests/batch-02.test.cjs` in each repository.
- Changed standalone and inline JavaScript passed syntax checks.
- All 30 COCKATOO precache paths resolve to existing files in the repository tree.
- GitHub trees after publication confirm every pre-existing blob outside the declared change list retains its hash.
- GitHub Pages build/deployment succeeded for each exact published commit (links above).
- Browser end-to-end, installed iOS update/offline/speech, physical NFC and Mac hardware/audio behavior were not tested. Deployment success is not device certification.
- External Netlify sites, custom domains and gift-provider availability were not verified or reconfigured.

## Routes and storage retained

| Repository | Existing routes | Storage/cache handling |
|---|---|---|
| COCKATOO | Root/index, manifest shortcuts, `?mode=low-energy`, all tour content | Existing `wareamah.*` storage keys retained; new scope-specific worker caches |
| Juicemoments | Root `?moment=`, `m/chloe-coffee.html`, `chlobo-25.html`, `chlobo-xxv/` | No new storage; recipient data unchanged |
| personal-sonic-postcards | Root, `juice-cinema.html?profile=…&mode=…`, V4, visualizer demos and profile paths | Existing profile/tap/log keys retained |

## Rollback

Use a normal revert of the listed batch commit on current main, retaining subsequent work. Do not reset or force-push. For COCKATOO, restoring worker code must also use a fresh cache version and the normal update path. If changes are reverted, update the same registry and append the result to this report.

## Remaining queues

- Continue substantive consolidation from registry stage 6: `111PLURAT`, `111PLURAT-backend`, `cratejuice`, `cratejuice-snaps`, `cratejuice-v1`. Inspect current sources and intended successors before moving content.
- Stages 4–5 still have physical-device gates and broader integration tasks listed per repository in `registry.json`.
- Voice Control integration, True Stem and Performance Capture are not implemented by this batch.
- Admin-only archive/delete and NICEDAYTODAY credential-revocation verification remain separate. No repository was archived or deleted.
- Mac-local runtime/hardware work remains separate. No Mac runtime changes were made.
- Batch 01 is unchanged; its six repairs and outstanding gates remain recorded in `batch-01.md`.
