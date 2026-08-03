## Context

`database.html` displays ~1,600 government budget line items, currently sourced live from a public Google Sheet on every page load (see proposal for the measured 3.44s/9.05MB cost). The sheet (`FILE_ID` in `database.html`) is publicly readable via its `gviz/tq` JSON endpoint without authentication — confirmed by fetching it directly with no credentials. `scripts/compile_data.py` exists but reads a different, stale source (a local Excel file with old sheet-tab names) that no longer matches either the live sheet's schema or what `database.html` actually consumes. The project already has one scheduled-nothing, event-driven GitHub Actions workflow (`.github/workflows/jekyll-gh-pages.yml`) that deploys on push to `main`; this change adds a second, schedule-triggered workflow that produces those pushes.

## Goals / Non-Goals

**Goals:**

- Reduce the per-visitor data-load cost of `database.html` from ~4s/9MB (live, uncached) to roughly the ~0.8s/1.3MB static-file baseline already measured.
- Keep the Google Sheet as the live editorial source of truth — staff keep editing the spreadsheet directly, with no new authoring workflow.
- Keep data freshness within a bounded, predictable window (30 minutes) rather than requiring a manual compile-and-deploy step for every edit.
- Avoid spurious commits/deploys when the spreadsheet hasn't actually changed between scheduled runs.

**Non-Goals:**

- Real-time (sub-second) reflection of spreadsheet edits. The agreed tradeoff is up to a 30-minute staleness window in exchange for removing the live per-visitor fetch cost.
- A manual "refresh now" trigger. The only refresh mechanism is the 30-minute schedule (`workflow_dispatch` for ad-hoc manual runs is acceptable as a side effect of using `on: schedule`, but is not a tracked requirement).
- Changes to `database.html`'s visual design, search/filter logic, or the shape of data already consumed by existing UI code (`planData['...']` field lookups) beyond the field-name realignment described below.
- `data/legislators.json` / `data/timeline.json` or their compiler functions — neither `index.html` nor `database.html` fetch them today, so they stay out of scope.
- Migrating data entry away from Google Sheets, or changing sheet permissions/authentication (the sheet is already publicly readable and this change relies on that remaining true).

## Decisions

### Compile directly from the live Google Sheet, not a re-exported Excel file

Two ways to get fresh data into the compiler: (a) export the live Sheet to `.xlsx` inside the CI job and feed it to a pandas-based compiler, matching the current `compile_data.py` shape, or (b) fetch the same `gviz/tq` JSON endpoints `database.html` already uses and parse those directly in Python, dropping the pandas/Excel dependency entirely.

Chosen: (b). The live sheet is fetched over HTTP with no authentication (verified: `curl` against `gid=612819456` returns `200` with the full dataset, no cookies or API key needed), so there is no credential-management burden to introduce. Parsing the same `gviz` response format the frontend already parses (strip the `google.visualization.Query.setResponse(...)` JSONP wrapper, read `table.cols`/`table.rows`) means the compiler and the frontend agree on the exact same source shape by construction — there is only one place that defines "what a row/column means" conceptually, even though the parsing logic itself is duplicated once in Python (compiler) and once in JavaScript (page, for the live-endpoint code path being removed... actually retained nowhere once this ships, since the page moves to static-file fetch). This removes the pandas/openpyxl dependency and the local `.xlsx` file from the pipeline entirely.

Rejected: (a) re-exporting to `.xlsx` and keeping the pandas-based compiler. This would preserve less of the existing script's logic than it first appears, since the sheet's tab/column layout has already diverged from what `compile_data.py` expects (`DemoD_分頁A/B` vs. the live `gid=612819456` single tab; old field names like `115年編列` vs. current `預算金額`) — the merge-two-sheets logic (`compile_budget`'s `df_a`/`df_b` join) no longer applies, since the live sheet is a single already-merged tab. Keeping pandas would add an export-and-parse step for no remaining benefit.

### Commit only when compiled output actually changed

The scheduled job computes the new `data/budget.json` / `data/themes.json` content and diffs it against the committed version before deciding whether to commit. Rejected alternative: always commit on every scheduled run regardless of diff. That would create a commit (and trigger a redundant `jekyll-gh-pages.yml` deploy) every 30 minutes even when the sheet hasn't changed, polluting history and wasting CI/deploy minutes for no observable benefit.

### Frontend fetches static files concurrently, not sequentially

`database.html`'s `initPage()` currently does `await fetch(sourceThemes)` fully to completion before calling `fetch(sourcePageA)`. Once both are local static files, there is no reason to serialize them — replace both `await` calls with a single `Promise.all([fetch(...), fetch(...)])`. Rejected alternative: leave them sequential since "it's fast now anyway" — even at local-file speeds, serializing two independent requests is strictly worse than running them concurrently, and the fix is a few lines.

## Implementation Contract

**Behavior**: After this change ships, opening `database.html` (or `115MoneyDemoB-main/database.html`) issues exactly two `fetch()` calls, both to same-origin static paths (`data/budget.json`, `data/themes.json`), issued concurrently via `Promise.all`. No request to `docs.google.com` is made from the browser. The rendered table and its search/filter behavior are unchanged from the user's perspective, aside from load time.

**Data shape**: `data/budget.json` is a JSON array; each element is a flat object with exactly these string keys: `計畫名稱`, `主管機關`, `所屬部會`, `政事別`, `預算金額` (string or number — match whatever `planData['預算金額']` currently expects when read from the live endpoint), `114年預算金額`, `工作內容`, `分支計畫`, `用途比例`, `計畫編號`, `關鍵字`, `預算書連結`. `data/themes.json` is a JSON array (or object — decided during implementation to match whatever `themeKeywords` in `database.html` needs) covering the same theme-label-to-keywords mapping the live theme tab currently provides.

**Compiler interface**: `python scripts/compile_data.py`, run with network access, fetches both `gid` tabs over HTTPS and writes `data/budget.json` and `data/themes.json`. Exit code is non-zero and a descriptive message goes to stderr if either fetch fails or returns a response that doesn't parse as the expected `gviz` wrapper format. On success, the script prints the record count written to each file.

**CI workflow**: A new GitHub Actions workflow, triggered `on: schedule` (every 30 minutes, cron `*/30 * * * *`) and additionally `on: workflow_dispatch` for manual runs. Steps: checkout, set up Python, run the compiler, `git diff --quiet` (or equivalent) against the two output files, and commit-and-push only if that diff is non-empty. A no-op run (no diff) SHALL exit successfully without creating a commit.

**Failure mode**: If the scheduled compile run fails (network error, unparseable sheet response), the workflow run fails visibly in the Actions tab and no commit is made — the site continues serving the last successfully compiled data rather than a partial or broken update. This is intentionally silent to end users (no error surfaces on the live site) but SHALL be visible to whoever checks the Actions tab.

**Acceptance criteria**:
- Running `python scripts/compile_data.py` locally, with network access, produces `data/budget.json` with ≥1,400 records containing all twelve listed fields, and `data/themes.json` with the theme entries.
- `database.html` and `115MoneyDemoB-main/database.html`, opened with `data/budget.json`/`data/themes.json` present locally, render the table with no requests to `docs.google.com` (verified via browser network panel / `read_network_requests`).
- The two fetches in `initPage()` are issued concurrently (verified by reading the diff — both `fetch()` calls are passed to `Promise.all` rather than separately `await`ed).
- A second consecutive run of the compiler against unchanged sheet data produces byte-identical output to the first run (needed for the CI diff-then-skip-commit logic to work).

**Scope boundaries**: In scope — `scripts/compile_data.py`, the new GitHub Actions workflow file, `database.html`'s and its mirror's `initPage()` fetch logic, `data/budget.json`, and the new `data/themes.json`. Out of scope — `index.html`, `data/legislators.json`, `data/timeline.json`, any change to search/filter/rendering logic beyond the fetch mechanism, and any change to the Google Sheet itself.

## Risks / Trade-offs

- **[Risk]** The live sheet's public `gviz` endpoint could become unavailable or have its sharing permissions changed, breaking the scheduled compile with no local fallback data source. → **Mitigation**: the workflow fails loudly (visible in Actions) without committing, so the site keeps serving its last-known-good static data instead of breaking — a strictly better failure mode than today's live-fetch-per-visitor approach, where a Sheets outage would break the page for every visitor immediately.
- **[Risk]** Up to 30 minutes of staleness after a spreadsheet edit could surprise an editor expecting immediate reflection (e.g. correcting a typo right before a deadline). → **Mitigation**: the workflow also supports `workflow_dispatch`, so a manual "run now" is one click away in the Actions tab if an editor needs the update sooner than the next scheduled tick.
- **[Risk]** Realigning field names (e.g. `115年編列` → `預算金額`) could silently break any other code path that reads the old field names from `data/budget.json`. → **Mitigation**: per the Non-Goals, `index.html` does not fetch `data/budget.json` at all (confirmed by grep), so `database.html`'s own `planData['...']` lookups are the only consumer, and this change updates the compiler output to match exactly what `database.html` already expects from the live endpoint today.
- **[Trade-off]** Dropping pandas/openpyxl in favor of parsing the `gviz` JSON format directly duplicates the "strip the JSONP wrapper" parsing logic that currently exists only in `database.html`'s JavaScript — now it exists once in Python too. This is accepted because the two implementations are independent (one runs in CI, one would be removed from the browser entirely once static fetch ships) and the parsing itself is a few lines.

## Migration Plan

1. Land the rewritten `scripts/compile_data.py` and manually run it once locally to produce a correct, up-to-date `data/budget.json` and the new `data/themes.json`; commit those outputs alongside the script so the static files are correct from the moment the frontend switches over.
2. Land the `database.html` (and mirror) `initPage()` change to fetch the local static files concurrently. Verify locally (per Implementation Contract acceptance criteria) before merging.
3. Land the new scheduled GitHub Actions workflow last, so the manual data produced in step 1 is already correct and in place before automation starts touching it.
4. No rollback data migration is needed: reverting is a plain git revert of these commits, which restores the previous live-fetch behavior immediately (at the cost of reintroducing the original performance problem).

## Open Questions

- Exact JSON shape for `data/themes.json` (flat array of `{label, keywords}` objects vs. an object keyed by label) — to be settled during implementation by matching whatever shape makes `database.html`'s existing `themeKeywords` construction simplest, since that consumer code is not changing otherwise.
