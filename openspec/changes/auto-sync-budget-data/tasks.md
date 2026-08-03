## 1. Compiler rewrite

- [x] 1.1 Rewrite `scripts/compile_data.py` to compile budget data from the live Google Sheet's `gid=612819456` tab via its `gviz/tq` endpoint, replacing the stale local-Excel-file source entirely (design decision: compile directly from the live Google Sheet, not a re-exported Excel file). Verify: running `python scripts/compile_data.py` with network access produces `data/budget.json` with at least 1,400 records, each containing all twelve fields (`計畫名稱`, `主管機關`, `所屬部會`, `政事別`, `預算金額`, `114年預算金額`, `工作內容`, `分支計畫`, `用途比例`, `計畫編號`, `關鍵字`, `預算書連結`).
- [x] 1.2 Compile theme definitions from the live Google Sheet's `gid=2136127994` tab, writing `data/themes.json`. Verify: `data/themes.json` contains an entry for every non-empty theme label present in the `gid=2136127994` tab.
- [x] 1.3 Confirm repeated compilation of unchanged sheet data is byte-identical between runs, matching the design decision to compile directly from the live Google Sheet rather than a re-exported Excel file. Verify: run the compiler twice in succession against unchanged sheet content and confirm the two resulting `data/budget.json` files are byte-for-byte identical (`diff` reports no difference).
- [x] 1.4 Confirm sheet-fetch failure causes a non-zero exit without touching existing output files. Verify: run the compiler against an unreachable/invalid endpoint (e.g. no network, or a deliberately wrong `gid`) and confirm a non-zero exit code, a descriptive stderr message, and that `data/budget.json`/`data/themes.json` are left unmodified.

## 2. Manual data refresh

- [x] 2.1 Run the rewritten compiler once locally against the live sheet and commit the resulting `data/budget.json` and `data/themes.json`, so the static files are correct before the frontend switches over (Migration Plan step 1). Verify: the committed `data/budget.json` contains ≥1,400 records with all twelve required fields, and `data/themes.json` contains the current theme entries.

## 3. Frontend static fetch

- [x] 3.1 Change `database.html`'s `initPage()` to load budget and theme data from local static files (`data/budget.json`, `data/themes.json`) instead of the live `gviz` endpoints. Verify: opening `database.html` with those local files present renders the table with no request to `docs.google.com` visible in the browser's network panel.
- [x] 3.2 Change the two fetches in `initPage()` to run concurrently via `Promise.all` instead of sequential `await` calls, matching the design decision that the frontend fetches static files concurrently, not sequentially, and delivering concurrent data fetching on page load. Verify: reading the diff shows both `fetch()` calls passed into a single `Promise.all`, with neither preceded by an `await` of the other's completed response.
- [x] 3.3 Apply the same `initPage()` fetch change to the `115MoneyDemoB-main/database.html` mirror for consistency with the root copy. Verify: the mirror's `initPage()` diff matches the root copy's fetch logic (same static paths, same `Promise.all` structure).
- [x] 3.4 Confirm the existing user-friendly error message still displays when static data cannot be loaded. Verify: temporarily rename or 404 one of `data/budget.json`/`data/themes.json`, load the page, and confirm the results area shows a Chinese user-visible error message rather than an unhandled JavaScript exception.

## 4. Scheduled sync workflow

- [x] 4.1 Add a new GitHub Actions workflow implementing scheduled recompilation with change-gated commits: triggered on a schedule of every 30 minutes (cron `*/30 * * * *`) and also on `workflow_dispatch` for manual runs. Verify: inspecting the workflow file shows both trigger types configured.
- [x] 4.2 Implement the change-gated commit logic so the workflow commits only when the compiled output actually changed, per the design decision to commit only when compiled output actually changed. Verify: manually triggering the workflow twice in a row with no sheet changes between runs results in no new commit on the second run.
- [x] 4.3 Confirm a changed-data run creates exactly one commit that in turn triggers the existing `jekyll-gh-pages.yml` deploy workflow. Verify: after a sheet edit, trigger the workflow and confirm the Actions run history shows the sync workflow's commit immediately followed by a `jekyll-gh-pages.yml` run.
- [x] 4.4 Confirm a compiler failure during a scheduled run is marked failed with no commit created, leaving previously deployed data untouched. Verify: temporarily point the workflow at an invalid endpoint, trigger it, and confirm the Actions run is marked failed with no new commit in the repository history.
