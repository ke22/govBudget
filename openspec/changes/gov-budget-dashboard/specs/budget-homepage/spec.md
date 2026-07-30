## ADDED Requirements

### Requirement: Page loads without errors

`index.html` SHALL load in a modern browser opened directly from the filesystem (file:// protocol) without any JavaScript console errors. All 9 sections SHALL render visible content without requiring a network connection beyond Google Fonts CDN.

#### Scenario: Clean load

- **WHEN** `index.html` is opened in a browser
- **THEN** the page renders with no JavaScript exceptions in the console and all 9 sections are visible

---

### Requirement: Header and navigation

The page SHALL render a header containing the site name and a navigation link to `database.html` labelled "查詢預算資料庫" (or equivalent).

#### Scenario: Database link is present and correct

- **WHEN** the page loads
- **THEN** a navigation link to `database.html` is visible in the header

---

### Requirement: Hero section

The page SHALL display a hero section with the headline: "115年總預算審議回顧　卡關逾200天才付委、718億先行動支有何隱憂".

#### Scenario: Headline rendered

- **WHEN** the page loads
- **THEN** the hero headline text appears prominently at the top of the page body

---

### Requirement: Timeline section rendered from JSON

The homepage SHALL fetch `data/timeline.json` and render a vertical visual timeline. Each event SHALL display a formatted date and the event description text. The timeline SHALL include all events in the data file.

#### Scenario: All timeline events appear

- **WHEN** `data/timeline.json` contains 6 events spanning 2025-09-30 to 2026-04-21
- **THEN** all 6 events are rendered as visible timeline nodes in chronological order

---

### Requirement: Historical budget review table

The page SHALL render a hardcoded HTML table of historical budget passage dates for 96年度 through 115年度. Columns SHALL be: 年度, 付委日期, 三讀日期, 執政黨.

#### Scenario: Table completeness

- **WHEN** the page loads
- **THEN** the historical table contains 20 rows (96年度 to 115年度) with 付委日期 and 執政黨 populated for every row

---

### Requirement: Impact section (2992億 breakdown)

The page SHALL display a section explaining that NT$299.2 billion in new budget items could not be executed, broken down as: 新興計畫 NT$101.7 billion, increased expenditures NT$180.5 billion, and reserve funds NT$17 billion.

#### Scenario: Breakdown figures visible

- **WHEN** the page loads
- **THEN** the figures 2992億, 1017億, 1805億, and 170億 all appear in the impact section

---

### Requirement: 718億 first-disbursement section

The page SHALL include a section explaining the opposition's NT$71.8 billion advance disbursement proposal: what it covers, when it passed, and the controversy around its constitutional basis.

#### Scenario: Section content present

- **WHEN** the page loads
- **THEN** the 718億 section contains text referencing the Kuomintang proposal, the 38 budget items, and the executive branch's objection

---

### Requirement: Budget overview section

The page SHALL display the 115年度 overall budget figures: 歲入 NT$2,862.3 billion, 歲出 NT$3,035 billion, and the top 4 政事別 breakdown (社會福利, 教育科學文化, 國防, 經濟發展) with their respective amounts.

#### Scenario: Top-level figures present

- **WHEN** the page loads
- **THEN** 歲入 2兆8623億 and 歲出 3兆350億 are displayed, along with the four 政事別 figures

---

### Requirement: Footer CTA buttons

The page SHALL display two call-to-action buttons in the footer area: one labelled "了解115年總預算概況" (anchor to the budget overview section on the same page) and one labelled "查詢完整預算資料庫" linking to `database.html`.

#### Scenario: CTA links resolve correctly

- **WHEN** the user clicks "查詢完整預算資料庫"
- **THEN** the browser navigates to `database.html`
