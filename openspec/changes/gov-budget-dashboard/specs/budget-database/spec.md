## ADDED Requirements

### Requirement: Load and display budget data

`database.html` SHALL fetch `data/budget.json` on page load and render the first 10 records as project cards. A results summary bar SHALL display the total count of matching records and the sum of `115年編列` for all matching records.

#### Scenario: Initial load shows first page

- **WHEN** `database.html` is opened in a browser and `data/budget.json` is present
- **THEN** exactly 10 project cards are rendered and the summary bar shows the total count (≥1,600) and total budget amount

#### Scenario: Data load failure shows user-friendly error

- **WHEN** `data/budget.json` cannot be fetched
- **THEN** the results area displays a user-visible error message in Chinese (not a raw JavaScript exception)

---

### Requirement: Keyword search across three fields

The database page SHALL provide a text input that filters records by matching the entered keyword against `計畫名稱`, `工作內容`, and `主管機關` using OR-union within fields. The search SHALL be case-insensitive and update results immediately on input change (no submit button required).

#### Scenario: Keyword search returns matching results

- **WHEN** the user types "TPASS" in the search input
- **THEN** only records where `計畫名稱`, `工作內容`, or `主管機關` contains "TPASS" are displayed, with count ≥ 1

#### Scenario: No-match search shows empty state

- **WHEN** the user types a string that matches no records (e.g., "xyzzy99999")
- **THEN** 0 cards are shown and the summary bar displays count 0

##### Example: field OR-union matching

| Keyword | Matches in... | Result |
|---|---|---|
| "TPASS" | 工作內容 | included |
| "國防部" | 主管機關 | included |
| "xyzzy99999" | (none) | excluded |

---

### Requirement: Theme pill filtering

The database page SHALL display 5 hardcoded theme pills: 🏠 居住正義, 👶 育兒少子化, 🛡️ 國防安全, ⚡ 能源綠能, 📺 媒體宣傳. Clicking a pill toggles it active; only one theme may be active at a time (clicking the active pill deactivates it). An active theme pill filters records by OR-matching the theme's keyword list against `計畫名稱` and `工作內容`.

#### Scenario: Theme pill reduces result count

- **WHEN** the user clicks the "🛡️ 國防安全" pill
- **THEN** only records matching at least one of ["國防", "軍事", "武器", "作戰", "軍備"] in `計畫名稱` or `工作內容` are shown, and the pill appears visually selected

#### Scenario: Clicking active pill deactivates it

- **WHEN** the user clicks an already-active theme pill
- **THEN** the theme filter is cleared, the pill is visually deselected, and results return to the pre-theme state

---

### Requirement: Ministry pill filtering

The database page SHALL render ministry pills dynamically from the unique `所屬部會` values of the currently filtered result set (after applying keyword and theme filters). Only one ministry may be active at a time. An active ministry pill filters records to those whose `所屬部會` matches exactly.

#### Scenario: Ministry pills update after theme filter

- **WHEN** the user activates a theme pill that narrows results to 3 ministries
- **THEN** only those 3 ministry pills are rendered (not all ministries in the full dataset)

#### Scenario: Ministry pill filters to exact match

- **WHEN** the user clicks a ministry pill (e.g., "國防部")
- **THEN** only records with `所屬部會 === "國防部"` are displayed

---

### Requirement: AND-intersection across all three filter axes

All three filter axes (keyword, theme, ministry) SHALL apply simultaneously as AND-intersection: a record appears in results only if it passes all active filters.

#### Scenario: Combined filters narrow results

- **WHEN** user has both a keyword "太陽能" and theme "⚡ 能源綠能" active
- **THEN** only records matching BOTH the keyword AND the theme filter appear

##### Example: triple-axis AND

- **GIVEN** keyword = "太陽能", active theme = "⚡ 能源綠能", active ministry = "經濟部"
- **WHEN** filters are applied
- **THEN** result includes only records where 計畫名稱/工作內容/主管機關 contains "太陽能" AND matches 能源 keywords AND 所屬部會 = "經濟部"

---

### Requirement: Pagination at 10 items per page

The database page SHALL paginate filtered results at 10 items per page. Navigation controls SHALL include previous/next buttons and page number indicators. Applying any filter change SHALL reset to page 1.

#### Scenario: Page navigation works

- **WHEN** filtered results contain 25 records and the user clicks "Next"
- **THEN** cards 11–20 are displayed and the current page indicator shows page 2

#### Scenario: Filter resets to page 1

- **WHEN** the user is on page 3 and types a new keyword
- **THEN** results display from page 1 with the new filtered set

##### Example: page count computation

| Filtered count | Expected page count |
|---|---|
| 0 | 0 (or 1 with empty state) |
| 10 | 1 |
| 11 | 2 |
| 1659 | 166 |

---

### Requirement: Project cards

Each result card SHALL display: `計畫名稱` as the card title, a `主管機關` badge, and `115年編列` formatted as a currency amount (e.g., NT$1.23億 or 1,230,000元). Cards SHALL be clickable to open the detail modal.

#### Scenario: Card content visible

- **WHEN** 10 cards are rendered
- **THEN** each card shows 計畫名稱, a 主管機關 badge, and a formatted 115年編列 amount

---

### Requirement: Detail modal

Clicking a project card SHALL open a modal overlay displaying: `計畫名稱`, `主管機關`, `115年編列`, `審定數` (or "待審定" if null), `114年金額` (or "—" if null), and `工作內容` as the full description. If the record's `用途比例` field is non-null, a Chart.js doughnut chart SHALL render inside the modal using the 用途比例 data.

The modal SHALL close when the user clicks the backdrop (outside the modal content area) or presses the Escape key. The Chart.js instance SHALL be destroyed on close to prevent canvas reuse errors.

#### Scenario: Modal shows all fields

- **WHEN** the user clicks a project card with all fields present
- **THEN** the modal displays 計畫名稱, 主管機關, 115年編列, 審定數, 114年金額, and 工作內容

#### Scenario: Pie chart renders when data present

- **WHEN** the user clicks a card whose `用途比例` is non-null
- **THEN** a Chart.js doughnut chart is visible inside the modal

#### Scenario: Modal closes on Escape

- **WHEN** the modal is open and the user presses the Escape key
- **THEN** the modal closes and the underlying page is visible
