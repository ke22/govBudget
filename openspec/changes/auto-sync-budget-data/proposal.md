## Why

`database.html` currently fetches its ~1,600-row dataset live from a public Google Sheets `gviz/tq` endpoint on every single page load, instead of using the pre-compiled static `data/budget.json` that the project's original design (the gov-budget-dashboard change) called for. Measured directly against production: the live main-data fetch alone takes 3.44s and transfers 9.05MB, versus 0.78s / 1.3MB for the equivalent static file already sitting unused on GitHub Pages. The live fetch is also cache-busted with a timestamp query parameter, so this cost is paid by every visitor on every load, and the theme fetch is awaited sequentially before the main fetch even starts, adding a second round-trip on top.

Git history shows this was not a deliberate real-time-sync requirement: the compiled-JSON approach shipped first, was abandoned the next day (`cbcf4bb`, "改接 Google Sheets CSV") so the author could iterate on spreadsheet columns without re-running the compiler, and further columns were added to the live sheet afterward (`f615c14`) that `scripts/compile_data.py` was never updated to produce. The compiler now also targets the wrong source entirely — a stale local Excel file with old sheet-tab names, not the live Google Sheet tabs (`gid=612819456`, `gid=2136127994`) the page actually reads from.

## What Changes

- Rewrite `scripts/compile_data.py` to read directly from the live Google Sheet's `gid=612819456` (main budget data) and `gid=2136127994` (theme definitions) tabs via their public `gviz/tq` JSON endpoints, replacing the stale local-Excel-file source entirely. Output field names are realigned to the columns the sheet actually has today: `計畫名稱`, `主管機關`, `所屬部會`, `政事別`, `預算金額`, `114年預算金額`, `工作內容`, `分支計畫`, `用途比例`, `計畫編號`, `關鍵字`, `預算書連結`.
- Add a new compiler output, `data/themes.json`, compiled from the theme tab (previously only ever fetched live, never compiled).
- Add a scheduled GitHub Actions workflow that runs the compiler every 30 minutes and commits `data/budget.json` / `data/themes.json` to `main` only when their content actually changed (no-op commits are skipped), so the existing `jekyll-gh-pages.yml` deploy only fires when data genuinely changed.
- Change `database.html`'s `initPage()` to fetch the local static `data/budget.json` and `data/themes.json` files instead of the live `gviz` endpoints, and to fetch them concurrently (`Promise.all`) instead of sequentially.
- Apply the same `initPage()` change to the `115MoneyDemoB-main/database.html` mirror for consistency with the root copy (the root copy is what GitHub Pages actually deploys).

## Capabilities

### New Capabilities

- `scheduled-budget-data-sync`: A GitHub Actions workflow that periodically (every 30 minutes) recompiles the live Google Sheet into `data/budget.json` and `data/themes.json`, committing only when content changes.
- `static-budget-data-fetch`: `database.html` loads its budget and theme data from local static JSON files, fetched concurrently, instead of live per-visitor Google Sheets requests.

### Modified Capabilities

(none — the relevant original specs from the gov-budget-dashboard change, named data-compiler and budget-database, were never archived into openspec/specs/, so there is nothing to modify there; this change supersedes their intent with the two new capabilities above)

## Impact

- Affected specs: `scheduled-budget-data-sync` (new), `static-budget-data-fetch` (new)
- Affected code:
  - New: .github/workflows/sync-budget-data.yml, data/themes.json
  - Modified: scripts/compile_data.py, database.html, 115MoneyDemoB-main/database.html, data/budget.json
  - Removed: (none)
