## 1. Data Compilation

- [x] 1.1 Implement the Data compiler (`scripts/compile_data.py`) as a Pre-compiled JSON data (offline, one-time) pipeline: reads sheets `DemoD_分頁A` and `DemoD_分頁B` from `115年預算案_各機關別_給美編.xlsx` and writes a merged array to `data/budget.json` with all required fields (Compile budget line items from Excel). Before writing any file the script SHALL print column headers of each processed sheet to stdout (Compiler reports column names on first run). Verify: run `python scripts/compile_data.py`; confirm column header output appears; `data/budget.json` exists with `len(json.load(...)) >= 1600` and contains required fields.

- [x] 1.2 Add timeline compilation to `scripts/compile_data.py`: reads sheet `DemoD_分頁D` and writes `data/timeline.json` as an array of `{date, event}` objects sorted ascending by date (satisfies "Compile timeline events from Excel" requirement). Verify: `data/timeline.json` contains ≥5 objects; dates are in `YYYY-MM-DD` format and in ascending order; first date is `2025-09-30` and last is `2026-04-21`.

- [x] 1.3 Add legislator compilation to `scripts/compile_data.py`: reads sheet `DemoD_分頁C` and writes `data/legislators.json` as a valid JSON array (satisfies "Compile legislator data from Excel" requirement). Verify: `data/legislators.json` exists and `json.load(...)` succeeds without error.

- [x] 1.4 Add missing-file guard: if `115年預算案_各機關別_給美編.xlsx` is not found, the script SHALL exit with status 1 and print a descriptive error to stderr — it SHALL NOT silently write empty arrays (satisfies "Missing Excel file causes a non-zero exit" requirement). Verify: rename the Excel file, run the script, confirm non-zero exit code and a stderr message; rename file back.

## 2. Shared Design System

- [x] 2.1 Implement the Single shared stylesheet (`index.css`) with CSS custom properties design decision — also satisfies the Shared stylesheet (`index.css`) Implementation Contract: create `index.css` declaring all 6 design tokens as CSS custom properties on `:root` (`--color-primary: #0A2A4A`, `--color-accent: #E63946`, `--color-bg: #F8F9FA`, `--color-card: #FFFFFF`, `--color-border: #DEE2E6`, `--font-family: 'Noto Sans TC', sans-serif`) plus base body, typography, card, badge, and button styles shared across both pages. Verify: both `index.html` and `database.html` link `index.css`; opening either page shows the navy/red CNA color scheme with Noto Sans TC font.

## 3. Homepage (index.html)

- [x] 3.1 Build the Homepage (`index.html`) shell using Vanilla HTML/CSS/JS with CDN-delivered Chart.js (no framework): link `index.css`, import Noto Sans TC from Google Fonts CDN, define the 9-section structure as semantic HTML elements (satisfies "Page loads without errors" requirement). Verify: open `index.html` in browser; no JavaScript console errors; all 9 section headings or containers are present in the DOM.

- [x] 3.2 Add Header section (site name + nav link "查詢預算資料庫" pointing to `database.html`) and Hero section with the exact headline "115年總預算審議回顧　卡關逾200天才付委、718億先行動支有何隱憂" (satisfies "Header and navigation" and "Hero section" requirements). Verify: headline text visible on page; header link href is `database.html`.

- [x] 3.3 Add Timeline section: write inline JavaScript that fetches `data/timeline.json` and renders a vertical timeline where each node shows the formatted date and event description (satisfies "Timeline section rendered from JSON" requirement). Verify: open `index.html` with `data/timeline.json` present; 6 timeline nodes render in ascending chronological order; earliest node shows 2025/09/30.

- [x] 3.4 Add hardcoded Historical Comparison Table: HTML table with columns 年度, 付委日期, 三讀日期, 執政黨 and 20 rows for 96年度–115年度 using the data from `新．總預算儀表板企劃.md` (satisfies "Historical budget review table" requirement). Verify: table renders with 20 data rows; 115年度 row shows 付委日期 `2026/4/21` and blank 三讀日期.

- [x] 3.5 Add Impact section showing the 2992億 breakdown: 新興計畫 1017億, 增加金額 1805億, 預備金 170億 with explanatory editorial text from the planning document (satisfies "Impact section (2992億 breakdown)" requirement). Verify: page shows all four figures — 2992億, 1017億, 1805億, 170億 — as visible text.

- [x] 3.6 Add 718億 section with editorial copy covering: the KMT proposal, 38 budget items, passage on 3 March 2026, and the Executive Yuan's constitutional objection (satisfies "718億 first-disbursement section" requirement). Verify: the text "718億" appears in the section; content references the KMT and Executive Yuan positions.

- [x] 3.7 Add Budget Overview section with hardcoded figures: 歲入 2兆8623億, 歲出 3兆350億, and the top 4 政事別 (社會福利 8318億, 教育科學文化 5566億, 國防 5488億, 經濟發展 4275億) (satisfies "Budget overview section" requirement). Verify: all six figures visible in the section.

- [x] 3.8 Add Footer CTA section with two buttons: "了解115年總預算概況" anchored to the budget overview section on the same page, and "查詢完整預算資料庫" linking to `database.html` (satisfies "Footer CTA buttons" requirement). Verify: clicking "查詢完整預算資料庫" navigates to `database.html`; clicking "了解115年總預算概況" scrolls to the budget overview section.

## 4. Database Page (database.html)

- [x] 4.1 Build the Database page (`database.html`) shell using Vanilla HTML/CSS/JS with CDN-delivered Chart.js: link `index.css`, write the `fetch('data/budget.json')` load function, render the first 10 records as project cards (計畫名稱 title, 主管機關 badge, formatted 115年編列 amount), and display the results summary bar showing total count and total 115年編列 sum (satisfies "Load and display budget data" and "Project cards" requirements). Verify: open `database.html`; 10 cards visible; summary bar shows count ≥ 1,600 and a total amount.

- [x] 4.2 Add JSON load failure handling: if `fetch('data/budget.json')` rejects or returns non-OK, display a user-visible error message in Chinese in the results area — no raw JS exception visible to the user (satisfies "Data load failure shows user-friendly error" requirement). Verify: temporarily rename `data/budget.json`; open `database.html`; confirm a Chinese error message appears instead of an exception; rename file back.

- [x] 4.3 Implement keyword search input: on `input` event, filter records by OR-union matching the keyword against `計畫名稱`, `工作內容`, and `主管機關` (case-insensitive, calls `applyFilters()` which resets to page 1) (satisfies "Keyword search across three fields" requirement). Verify: type "TPASS" in search box; cards update to show ≥1 result; type "xyzzy99999"; 0 cards shown; summary shows count 0.

- [x] 4.4 Implement 5 hardcoded theme pills (🏠 居住正義, 👶 育兒少子化, 🛡️ 國防安全, ⚡ 能源綠能, 📺 媒體宣傳) using the Theme pill keyword dictionaries (hardcoded) design decision with toggle-one-active behavior. Each active pill OR-matches its keyword list against `計畫名稱` and `工作內容`. Clicking the active pill deactivates it (satisfies "Theme pill filtering" requirement). Verify: click "🛡️ 國防安全"; result count decreases; pill is visually selected; click it again; filter clears; result count returns to pre-filter value.

- [x] 4.5 Implement dynamic ministry pills: after each `applyFilters()` call, extract unique `所屬部會` values from the current filtered set and render as toggle pills (one-active). An active ministry pill exact-matches `所屬部會`. Ministry pills update whenever keyword or theme filter changes (satisfies "Ministry pill filtering" requirement). Verify: activate 國防安全 theme; note ministry pills update to only ministries present in that filtered set; select a ministry pill; results narrow further.

- [x] 4.6 Verify the AND-intersection filter across three independent axes design decision: `applyFilters()` applies keyword AND theme AND ministry simultaneously as AND-intersection. Combined filters must narrow results (not expand them). This satisfies the "AND-intersection across all three filter axes" requirement. Verify: enter keyword "能源", activate "⚡ 能源綠能" theme, then select "經濟部" ministry; confirm result count is ≤ count with any single filter alone.

- [x] 4.7 Implement Pagination at 10 items/page: previous/next buttons, page number display, direct page-number jump. Any filter change resets to page 1 (satisfies "Pagination at 10 items per page" requirement). Verify: with ≥11 results, click "Next"; cards 11–20 appear; page indicator shows 2; type a new keyword; page indicator resets to 1.

- [x] 4.8 Implement Detail modal rendered inline using a single `<div id="modal">` element in `database.html`: clicking a card populates the modal and removes the `hidden` class. Display 計畫名稱, 主管機關, 115年編列, 審定數 (or "待審定" if null), 114年金額 (or "—" if null), 工作內容. If `用途比例` is non-null, instantiate a Chart.js doughnut chart (Vanilla HTML/CSS/JS with CDN-delivered Chart.js). Destroy Chart.js instance on close. Close on backdrop click or Escape key (satisfies "Detail modal" requirement). Verify: click a card; modal shows all fields; press Escape; modal closes. Click a card with `用途比例` data; doughnut chart renders inside modal.

## 5. End-to-End Verification

- [x] 5.1 Open both `index.html` and `database.html` in a browser confirming the full Scope boundaries from the Implementation Contract: no JavaScript console errors; all 9 homepage sections have visible content; timeline nodes render; database search/filter/pagination/modal all function correctly; CTA buttons navigate to the correct targets (satisfies "Page loads without errors" for both pages and the full Implementation Contract). Verify: manual walkthrough of golden path — compile data → open homepage → follow CTA to database → search + filter + open modal.
