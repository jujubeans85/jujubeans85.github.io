# Batch 01 · 16 September 2026

Six repository repairs published to main. Rollback branches retain every previous tip. Repository mergers/archival are not certified complete.

| Repository | Published commit | Previous main |
|---|---|---|
| chlomim | [e2ba69ee6e](https://github.com/jujubeans85/chlomim/commit/e2ba69ee6e629f9d457dacf9f3b406c5e74971cd) | `4d79a6627b521109c423ebcba5022f280e3049c9` |
| Sundayjuice | [ef74ec7933](https://github.com/jujubeans85/Sundayjuice/commit/ef74ec79331abd8129f623dacb9bda6bfe2aefab) | `86f740f9a4ed8b449b2b6e1cb86936ccd04fc26d` |
| FONT_JUICE | [c9dc860e5f](https://github.com/jujubeans85/FONT_JUICE/commit/c9dc860e5fb57aa4182ed8ddf7e07ef69400f846) | `03b32e8e428624c3cf9fe43d799b11d588432c10` |
| TXTJUICE | [e906cdebde](https://github.com/jujubeans85/TXTJUICE/commit/e906cdebde35a37abcbb113f30e2698276f016fe) | `e5b46161a941ace8981c4c1d0b6a2d6a54f64778` |
| JUICE-PLAY-CLOCK | [1a71002b9a](https://github.com/jujubeans85/JUICE-PLAY-CLOCK/commit/1a71002b9a4accebf88b43e0ce48e51aef6a36aa) | `b82b7cddbc53c7ca2f48a5d9c2a65d9240778a4b` |
| cratejuice-studio | [8e3386818b](https://github.com/jujubeans85/cratejuice-studio/commit/8e3386818bc3a312ccd5d55c299a69f4436307b2) | `ff2d44e85e47a12a6ba3f3b44032e4701ee3cf3e` |

## What changed

- Cans/chlomim: batch URL and CSV input, strict URL validation and shell argument isolation, no-overwrite and bounded retry options, opt-in playlists, working root entry and scoped offline assets, current instructions, larger controls. Sundayjuice’s 18 descriptive audio controls are preserved in a separate local prompt builder.
- Sundayjuice: both entry filename cases forward to Cans; source history preserved. No fake OCR remains on the active entry page.
- TXTJUICE: links forward to Fonts with query/hash intact; retirement worker does not delete shared-origin caches.
- FONT_JUICE: pinned native canvas test dependency and lockfile; glyph/data routes and renderer remain intact.
- Clock: scope-specific cache namespace and lookups, no immediate takeover of open app sessions. Progress/edition code retained.
- Studio: resolved active merge-conflict routes/config; home and /crate/ reach the standalone Crate Stacker. OCR failure recovers without replacing typed tracklists; Press remains a separate capability.

## Verification

Passed: 20 real Bash argument-isolation cases using a harmless yt-dlp stub; URL/CSV parsing; UI boot, copy guards and repeat import using a DOM simulation; service-worker scope checks; all Cans/Clock precache paths; JavaScript parsing; existing Fonts suites for 534 glyph masks, transparency, export, routing and dictation lifecycle.

Not verified: physical iOS/a-Shell downloads, native clipboard/Home Screen interaction, browser end-to-end checks (browser executable absent and download timed out), external Netlify hosting, OCR provider accuracy or Press backend. Source publication is not live certification.

Before publication, Cans, Fonts and Clock returned HTTP 200 on GitHub Pages. Sundayjuice and TXTJUICE returned 404 and were not enabled as new Pages sites. Existing external hosts were not reconfigured.

## Open portfolio work

The other portfolio actions remain tracked in registry.json. Archive/delete administration is unavailable through the connected tools. Credential revocation needs owner verification; local Mac/control work remains outside this iOS approval. Content migrations still require unique-source and incoming-route checks. No repository was deleted or archived in this batch.


## Deployment evidence

GitHub Pages build-and-deployment workflows completed successfully for the published Cans, Fonts and Clock commits. No GitHub Actions deployment was reported for Sundayjuice, TXTJUICE or cratejuice-studio.
