## ADDED Requirements

### Requirement: Compile budget line items from Excel

The compiler SHALL read sheets `DemoD_分頁A` and `DemoD_分頁B` from `115年預算案_各機關別_給美編.xlsx` in the project root and write a single merged array to `data/budget.json`.

Each element in the output array SHALL include the fields: `計畫名稱` (string), `主管機關` (string), `所屬部會` (string), `115年編列` (number), `審定數` (number or null), `114年金額` (number or null), `工作內容` (string), and `用途比例` (object mapping category labels to numeric percentages, or null when absent).

The output file SHALL contain at least 1,600 objects.

#### Scenario: Successful compilation produces budget.json

- **WHEN** `python scripts/compile_data.py` is run from the project root and `115年預算案_各機關別_給美編.xlsx` is present
- **THEN** `data/budget.json` is written and contains a JSON array of at least 1,600 objects, each with the required fields

#### Scenario: Missing Excel file causes a non-zero exit

- **WHEN** `python scripts/compile_data.py` is run and the Excel source file is not found
- **THEN** the script exits with a non-zero status code and prints a descriptive error message to stderr

##### Example: minimum field presence

- **GIVEN** the Excel sheets are present
- **WHEN** the compiler runs
- **THEN** every object in `data/budget.json` contains keys: `計畫名稱`, `主管機關`, `所屬部會`, `115年編列`, `工作內容`

---

### Requirement: Compile timeline events from Excel

The compiler SHALL read sheet `DemoD_分頁D` and write sorted event objects to `data/timeline.json`.

Each element SHALL contain `date` (string in `YYYY-MM-DD` format) and `event` (string description). The array SHALL be sorted ascending by date. The output SHALL contain at least 5 objects covering the range 2025-09-30 to 2026-04-21.

#### Scenario: Timeline file contains required date range

- **WHEN** compilation succeeds
- **THEN** `data/timeline.json` contains objects with dates spanning from 2025-09-30 to 2026-04-21 in ascending order

##### Example: event ordering

| Input dates (unordered) | Expected output order |
|---|---|
| 2026-04-21, 2025-09-30, 2026-01-01 | 2025-09-30, 2026-01-01, 2026-04-21 |

---

### Requirement: Compile legislator data from Excel

The compiler SHALL read sheet `DemoD_分頁C` and write an array of legislator objects to `data/legislators.json`. The exact schema is determined by the sheet's column structure. The file SHALL be a valid JSON array (may be empty if the sheet has no data rows).

#### Scenario: Legislators file is written

- **WHEN** compilation succeeds
- **THEN** `data/legislators.json` exists and is a valid JSON array

---

### Requirement: Compiler reports column names on first run

The compiler SHALL print the column names found in each sheet to stdout before writing any output files, so the implementer can verify the field-name mapping before proceeding.

#### Scenario: Column names printed before output

- **WHEN** `python scripts/compile_data.py` is run
- **THEN** the script prints the column headers of each processed sheet to stdout before writing any JSON file
