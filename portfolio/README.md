# JUICE repository overhaul

The owner approved all rows in the 15 September decision pack on 16 September 2026, superseding the blank returned PDF. Work runs in substantial related batches without repeated routine approval prompts. Preservation and verification remain part of execution.

`registry.json` is the portfolio decision and progress index. It records all 43 repositories. `batch-01.md` and `batch-02.md` record shipped changes and rollback baselines. A proposed merge/archive is not complete merely because it was approved.

## Architecture

Keep one canonical implementation per function. Cans/chlomim owns URL-to-command generation and the migrated descriptive prompt builder. FONT_JUICE owns the handwriting compositor. Keep distinct app icons, recipient content, query routes and runtime boundaries. Extract shared code only when a second working consumer demonstrates the need; use pinned local modules rather than a runtime framework dependency.

## Release checks

- Record source commit, deployed entry path, cache/storage namespace, preserved routes and rollback commit.
- Test the changed behavior, failure handling and update path; keep physical device checks separate from simulated tests.
- Publish related source changes together per repository. Never force-push a changed main branch.
- A retirement requires unique assets/history preserved, verified successor and incoming URL/hosting checks.

## Actual blockers

GitHub source-edit tools do not expose repository archival/deletion or token administration. NICEDAYTODAY's previously reported credential-like value needs owner revocation verification; it is never reproduced or tested. Local control/hardware behavior needs access to the actual runtime and remains separate from iOS authorization. No new subscription, DNS, visibility or licence changes are part of this batch.
