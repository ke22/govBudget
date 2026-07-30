# Gov Budget Dashboard — 115年度總預算儀表板

## Summary

Build a two-page static dashboard for CNA's coverage of the 115年度 (FY2026) central government budget standoff. The project consists of:

1. **Homepage** (`index.html`) — Journalistic storytelling: why the budget was delayed, the historical context, the 718億 first-disbursement controversy, and CTAs to the database.
2. **Database page** (`database.html`) — Searchable, filterable table of 1,600+ budget line items across all agencies.

Data is pre-compiled from `115年預算案_各機關別_給美編.xlsx` into static JSON files. No backend required.

## Non-Goals

- No server-side code or database
- No user authentication
- No real-time Google Sheets sync (data compiled offline)
- No framework (React, Svelte, Vue) — plain HTML/CSS/JS only

## Proposed File Structure

```
govBudget/
├── index.html              ← Homepage: story + timeline + CTAs
├── database.html           ← Database: search + filter + modal
├── index.css               ← Shared design tokens & components
├── data/
│   ├── budget.json         ← Compiled from DemoD_分頁A+B (~1,659 rows)
│   ├── legislators.json    ← Compiled from DemoD_分頁C (116 legislators)
│   └── timeline.json       ← Compiled from DemoD_分頁D (5+ events)
└── scripts/
    └── compile_data.py     ← One-time Excel → JSON compiler
```

## Page 1: Homepage (`index.html`)

### Sections (in order)

1. **Header** — Site name + nav link to database
2. **Hero** — Headline: "115年總預算審議回顧　卡關逾200天才付委、718億先行動支有何隱憂"
3. **Explainer** — Why the budget was delayed (軍警待遇條例 context)
4. **Timeline** — Visual vertical timeline from data/timeline.json (dates: 2025-09-30 → 2026-04-21)
5. **Historical comparison table** — 歷年付委/三讀日期 (96年度–115年度), sourced from planning doc
6. **Impact section** — 2992億 breakdown: 1017億新興計畫 + 1805億增加 + 170億預備金
7. **718億 section** — First-disbursement context and controversy
8. **Budget overview** — 歲入/歲出 totals, top 4 政事別 breakdown
9. **Footer CTA** — Two buttons: "了解115年總預算概況" (internal) + "查詢完整預算資料庫" → database.html

### Design Tokens

- Font: Noto Sans TC (Google Fonts) — supports Traditional Chinese
- Primary: `#0A2A4A` (dark navy)
- Accent: `#E63946` (CNA red)
- Background: `#F8F9FA`
- Card bg: `#FFFFFF`
- Border: `#DEE2E6`

## Page 2: Database (`database.html`)

### Features

- **Keyword search** — full-text across 計畫名稱, 工作內容, 主管機關
- **Theme pills** (dynamic, AND-intersection logic):
  - 🏠 居住正義, 👶 育兒少子化, 🛡️ 國防安全, ⚡ 能源綠能, 📺 媒體宣傳
- **Ministry pills** — dynamically generated from filtered data
- **Results summary bar** — count + total amount
- **Project cards** — 計畫名稱, 主管機關 badge, 預算金額
- **Pagination** — 10 items/page
- **Detail modal** — 115年編列, 審定數, 114年金額, 工作內容, 用途比例 pie chart (Chart.js)

### Filter Logic

All three axes use AND-intersection:
```
result = data WHERE
  keyword matches (計畫名稱 OR 工作內容 OR 主管機關) AND
  theme matches (theme keyword dict) AND
  ministry matches (所屬部會)
```

## Data Compilation

Run `scripts/compile_data.py` using Python 3.13 + pandas/openpyxl (already installed) to produce:

- `data/budget.json` — from sheets `DemoD_分頁A` and `DemoD_分頁B`
- `data/legislators.json` — from sheet `DemoD_分頁C`
- `data/timeline.json` — from sheet `DemoD_分頁D`

## Tasks

- [ ] Write `scripts/compile_data.py` and generate JSON files
- [ ] Build `index.css` (shared design system)
- [ ] Build `index.html` (homepage) with all 9 sections
- [ ] Build `database.html` (database page) with search/filter/modal
- [ ] Verify both pages work by opening locally in browser
