# Batch 03 · 19 September 2026

Stage-6 source consolidation is partially shipped in **personal-sonic-postcards**, with all five legacy source repositories preserved. This is not completion of stage 6 or permission to skip its retirement gates.

## Published result

[Source commit 7110f9ede1](https://github.com/jujubeans85/personal-sonic-postcards/commit/7110f9ede1e0b3eee0c42d697854422bdcdb8d5a)

[Collection entry](https://jujubeans85.github.io/personal-sonic-postcards/collections/) · [Detailed migration notes](https://github.com/jujubeans85/personal-sonic-postcards/blob/main/docs/BATCH-03.md) · [Preservation manifest](https://github.com/jujubeans85/personal-sonic-postcards/blob/main/docs/stage-6-preservation.json)

- New recipient collection with eight vintage postcard/audio pairs, shareable `?t=vintage-1` through `?t=vintage-8` links, print controls, 18 Chloe/Mimi print images recovered from ZIP, and local photo preview.
- All 47 copied source files are byte-preserved. Historical WAVs are approximately two-second samples, labelled demonstration audio in the maintained gallery.
- Reusable slug/share functions extracted from 111PLURAT. Original seed data retained as reference; its three original seed slugs are not redirected to unrelated cards.
- Image-preview idea salvaged from the syntactically broken cratejuice-snaps source. File/type limits, decoded-pixel check and object-URL cleanup are implemented. No upload or persistence.
- Library indexer extracted from cratejuice with explicit paths, nested-file support, URL encoding, stable IDs, symlink containment and refusal to overwrite existing catalogues. It does not decode or certify media.
- 111PLURAT backend source retained as inert reference with the postcard parent. It is not installed or deployed.
- Full preservation inventory covers 253 tracked files and members of all 16 ZIPs across five legacy repositories. Other unique content remains at its original source.

## What changed where

| Repository | Result |
|---|---|
| personal-sonic-postcards | 59 added/changed files: collection, preserved assets/reference source, preview/catalogue modules, indexer, tests, documentation and one root link |
| 111PLURAT | Source unchanged; partial capability/data extraction documented in registry |
| 111PLURAT-backend | Source unchanged; useful backend reference preserved in successor |
| cratejuice | Source unchanged; library indexer extracted and repaired |
| cratejuice-snaps | Source unchanged; preview reimplemented in successor |
| cratejuice-v1 | Source unchanged; postcard/audio/print assets preserved in successor |
| jujubeans85.github.io | Registry, portfolio README and this report updated |

## Evidence

- Nine Node tests plus two Python tests pass, including existing Batch-02 NFC regression tests.
- All 47 copied files retain their source SHA-256; all 42 uploaded binary blobs match locally calculated Git hashes.
- Published successor tree confirms all 19 pre-existing blobs outside README/index changes retain their Git hashes.
- Local HTML references and catalogue media paths resolve; WAV headers parse.
- [Pages deployment](https://github.com/jujubeans85/personal-sonic-postcards/actions/runs/35432934086) for the exact source commit: **success**.
- Browser end-to-end/visual inspection remains unverified: Chromium was unavailable and its download timed out.
- Physical iPhone/iPad, existing installed-app update, NFC hardware, printing and Mac runtime/audio remain separate, unverified gates. No Mac files, services, dependencies or audio setup were changed.

## Preservation and rollback

Every listed repository has `rollback/batch-03-2026-09-19` at its pre-batch baseline:

| Repository | Baseline |
|---|---|
| personal-sonic-postcards | `c84176153d583b21cbf52658e5da3677daeb3167` |
| 111PLURAT | `304f566f5fe501bf627b9f69f6e62af03c80f1bd` |
| 111PLURAT-backend | `1ac8b4e515a77c913e17d919979b3c32a4270923` |
| cratejuice | `1279a5e60fc678823cfb9c66311021f806073458` |
| cratejuice-snaps | `3d166cce51fd1e38ebf444d70f0e2b995ed8ee0d` |
| cratejuice-v1 | `7823acce25bca9bbc363ba0bd668cdb972f5b967` |
| jujubeans85.github.io | `80a5a3abccea26723ef3523f71c7fa81614596db` |

Revert the source batch commit normally; never reset or force-push main. No legacy file was deleted or moved. Existing ZIP downloads, Cinema/NFC/visualizer/profile routes and localStorage keys remain. No new cache/storage namespace is introduced. Legacy repo main branches were not changed, avoiding accidental competing Netlify deploys.

## Remaining work

- Verify the new gallery in a browser/iOS; current Batch-02 acceptance remains open.
- Complete export/import for 111PLURAT user-created `cratejuice_crate` records; map exact legacy slugs and incoming URLs before redirects.
- Select and test any backend contract. Preserved code has persistence, ID, CORS and access-control limitations; the new gallery itself needs no backend.
- Continue cratejuice's remaining player, QR/print, library/gift-packaging/API migrations after proving each candidate. The old destructive packager is not promoted.
- Determine cratejuice-v1's actual external hosting binding; existing workflows publish different directory trees. Other ZIP-only HTML/SoundCloud variants and playlists remain at source.
- Archive/delete remains unavailable in this session and blocked by compatibility gates independently of admin access. NICEDAYTODAY's credential-verification gate is unchanged.
- Monthly audits remain read-only by default. Repository approval does not authorize chat deletion or Mac-local changes.

Existing approval stands. No repeated portfolio questionnaire is required.
