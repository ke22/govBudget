## Context

CNA (中央通訊社) is publishing a two-page interactive dashboard covering the 115年度 (FY2026) central government budget standoff. The source data is `115年預算案_各機關別_給美編.xlsx` which already exists in the project root. A detailed planning document (`新．總預算儀表板企劃.md`) provides the editorial copy and historical data tables.

The dashboard must ship as a fully static site — no build step, no bundler, no framework, no server. Pages open directly in a browser from the filesystem or any static host.

## Goals / Non-Goals

**Goals:**

- Compile Excel source data into three static JSON files consumable by the browser
- Build a journalistic homepage (`index.html`) that tells the story of the budget delay
- Build a searchable/filterable budget database page (`database.html`) over 1,600+ line items
- Present the content in Traditional Chinese with a professional news design aesthetic

**Non-Goals:**

- No server-side rendering or backend of any kind
- No authentication or user accounts
- No real-time data sync — data is compiled once offline
- No JavaScript framework (React, Svelte, Vue, etc.)
- No build tools (webpack, Vite, etc.) — plain `<script>` and `<link>` tags only
- No legislator data display on either page (legislators.json compiled but reserved for future use)

## Decisions

### Vanilla HTML/CSS/JS with CDN-delivered Chart.js

Plain HTML/CSS/JS satisfies the "no framework" constraint and keeps the deployment artifact minimal. Chart.js is delivered via CDN (`<script>` tag) for the detail modal's 用途比例 pie chart — the only interactive visualization. No other third-party JS libraries are required.

Alternatives considered: using a lightweight framework (Alpine.js, Petite-Vue) — rejected because the interactive surface (search + filter + pagination + one modal) does not justify the dependency.

### Single shared stylesheet (`index.css`) with CSS custom properties

All design tokens (colors, fonts, spacing) are declared as CSS custom properties on `:root` and imported by both pages. This enforces visual consistency without a preprocessor.

Alternatives considered: inline styles per page — rejected because it duplicates token values and makes brand changes require editing multiple files.

### Pre-compiled JSON data (offline, one-time)

`scripts/compile_data.py` is a one-time script that reads the Excel file and writes three JSON files to `data/`. The browser fetches these files with `fetch()`. No runtime data transformation occurs in the browser beyond filtering and display.

Alternatives considered: reading the xlsx directly in the browser — rejected because xlsx parsing in the browser adds ~500KB dependency and is fragile across sheet format changes.

### AND-intersection filter across three independent axes

All three filter axes (keyword search, theme pill, ministry pill) use AND-intersection: a record must match all active filters simultaneously. Within keyword search, the three fields (計畫名稱, 工作內容, 主管機關) use OR-union. This matches the expected behavior for narrowing results.

State model: three module-level variables (`currentKeyword`, `activeTheme`, `activeMinistry`) are updated by event listeners and trigger `applyFilters()` which re-computes `filteredData` and calls `renderPage(1)`.

### Theme pill keyword dictionaries (hardcoded)

Theme pills map display labels to keyword arrays that are OR-matched against 計畫名稱 and 工作內容:

| Theme label | Keywords |
|---|---|
| 🏠 居住正義 | `["住宅", "租金", "社會住宅", "居住"]` |
| 👶 育兒少子化 | `["生育", "托育", "育兒", "少子", "幼兒"]` |
| 🛡️ 國防安全 | `["國防", "軍事", "武器", "作戰", "軍備"]` |
| ⚡ 能源綠能 | `["能源", "綠能", "再生", "太陽能", "風電"]` |
| 📺 媒體宣傳 | `["媒體", "宣傳", "廣播", "傳播", "新聞"]` |

Ministry pills are generated dynamically from the 所屬部會 field of the currently filtered data.

### Pagination at 10 items/page

10 items per page balances information density against scroll fatigue on a card layout. Pagination controls show page numbers derived from `Math.ceil(filteredData.length / PAGE_SIZE)`.

### Detail modal rendered inline

The detail modal is a single `<div id="modal">` element in `database.html`. Opening a card populates the modal's inner HTML and removes the `hidden` class. Chart.js instance is created fresh per open and destroyed on close to avoid canvas reuse errors.

## Implementation Contract

### Data compiler (`scripts/compile_data.py`)

- **Behavior**: Running `python scripts/compile_data.py` from the project root reads `115年預算案_各機關別_給美編.xlsx` and writes three files.
- **Output files and shapes**:
  - `data/budget.json` — array of objects from sheets `DemoD_分頁A` and `DemoD_分頁B`. Each object must include at minimum: `計畫名稱` (string), `主管機關` (string), `所屬部會` (string), `115年編列` (number), `審定數` (number, may be null), `114年金額` (number, may be null), `工作內容` (string), `用途比例` (object or null — keys are category labels, values are numeric percentages summing to 100).
  - `data/legislators.json` — array of legislator objects from sheet `DemoD_分頁C` (schema TBD by sheet structure, reserved for future use).
  - `data/timeline.json` — array of `{date: "YYYY-MM-DD", event: "..."}` objects from sheet `DemoD_分頁D`, sorted ascending by date.
- **Failure mode**: if the Excel file is missing or a sheet is not found, the script exits with a non-zero status and a descriptive error message. It does NOT silently write empty arrays.
- **Acceptance criteria**: after running the script, `data/budget.json` exists and contains at least 1,600 objects; `data/timeline.json` exists and contains at least 5 objects; opening `database.html` in a browser shows records loaded.

### Homepage (`index.html`)

- **Behavior**: Loads without JavaScript errors in a modern browser opened from the filesystem. All 9 sections render visible content.
- **Timeline section**: fetches `data/timeline.json` and renders a vertical timeline. Each event shows a formatted date (MM/DD/YYYY → 中文 format optional) and the event description. The 6 events from the planning doc (2025-09-30 through 2026-04-21) must all appear.
- **Historical comparison table**: hardcoded HTML table with rows for 96年度–115年度 using data from the planning doc. Columns: 年度, 付委日期, 三讀日期, 執政黨.
- **Budget overview section**: displays hardcoded figures: 歲入 2兆8623億, 歲出 3兆350億, and the top 4 政事別 breakdown (社會福利 8318億, 教育科學文化 5566億, 國防 5488億, 經濟發展 4275億).
- **Acceptance criteria**: opening `index.html` in a browser shows all 9 sections; no console errors; CTA buttons link to their targets; timeline items visible; historical table complete.

### Database page (`database.html`)

- **Behavior**: Fetches `data/budget.json` on load, renders the first 10 results. The results summary bar shows total count and sum of 115年編列.
- **Filter behavior**: every change to keyword input, theme pill, or ministry pill re-runs `applyFilters()` and resets to page 1. AND-intersection is enforced across all three axes.
- **Ministry pills**: rendered from the unique 所屬部會 values of the *currently filtered* result set (not the full dataset), updating on every filter change.
- **Pagination**: previous/next buttons and page number display. Clicking a page number jumps directly to that page.
- **Detail modal**: clicking a card opens the modal with all available fields. If `用途比例` data is present, a Chart.js doughnut chart renders inside the modal. Clicking outside the modal or pressing Escape closes it.
- **Failure mode**: if `data/budget.json` fails to load (file not found), the results area displays a user-visible error message in Chinese, not a raw JS exception.
- **Acceptance criteria**: keyword search for "TPASS" returns at least 1 result; selecting a theme pill reduces the visible record count; opening a modal shows 計畫名稱, 主管機關, 115年編列, and 工作內容; pie chart renders for items with 用途比例 data.

### Shared stylesheet (`index.css`)

- All six design tokens defined as CSS custom properties on `:root`: `--color-primary`, `--color-accent`, `--color-bg`, `--color-card`, `--color-border`, `--font-family`.
- Both `index.html` and `database.html` link to `index.css` as their sole external stylesheet.

### Scope boundaries

In scope: `scripts/compile_data.py`, `data/budget.json`, `data/legislators.json`, `data/timeline.json`, `index.html`, `database.html`, `index.css`.

Out of scope: any server, build tool, framework, or deployment configuration. The legislator data page is out of scope — `legislators.json` is compiled but not displayed.

## Risks / Trade-offs

- [Risk] Excel sheet column names may differ from assumptions → Mitigation: `compile_data.py` should print a column-name report on first run; implementer must verify column names match before hardcoding field mappings.
- [Risk] `用途比例` field may not exist in all rows or may use an inconsistent format → Mitigation: compile step normalizes to `null` when absent; modal renders chart only when `用途比例 !== null`.
- [Risk] 1,600+ item JSON file may be slow to load on a mobile connection → Mitigation: the file is a one-time fetch cached by the browser; no lazy-loading is required for this scope, but the file size should be checked after compilation (target < 2MB).
- [Risk] Traditional Chinese font (Noto Sans TC) requires network fetch → Mitigation: `@import` from Google Fonts CDN; pages degrade gracefully to system fonts if offline.
