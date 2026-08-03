## ADDED Requirements

### Requirement: Compile budget data from the live Google Sheet

The compiler (`scripts/compile_data.py`) SHALL fetch the live Google Sheet's `gid=612819456` tab via its public `gviz/tq` JSON endpoint and write the parsed rows to `data/budget.json`. The compiler SHALL NOT read any local Excel file as its data source.

Each element in the output array SHALL be a flat object containing exactly these keys: `計畫名稱`, `主管機關`, `所屬部會`, `政事別`, `預算金額`, `114年預算金額`, `工作內容`, `分支計畫`, `用途比例`, `計畫編號`, `關鍵字`, `預算書連結`.

The output file SHALL contain at least 1,400 objects.

#### Scenario: Successful compilation produces budget.json from the live sheet

- **WHEN** `python scripts/compile_data.py` is run with network access to the live Google Sheet
- **THEN** `data/budget.json` is written and contains a JSON array of at least 1,400 objects, each containing all twelve required keys

##### Example: required field set

| Field | Present |
|---|---|
| 計畫名稱 | yes |
| 主管機關 | yes |
| 所屬部會 | yes |
| 政事別 | yes |
| 預算金額 | yes |
| 114年預算金額 | yes |
| 工作內容 | yes |
| 分支計畫 | yes |
| 用途比例 | yes |
| 計畫編號 | yes |
| 關鍵字 | yes |
| 預算書連結 | yes |

#### Scenario: Sheet fetch failure causes a non-zero exit

- **WHEN** `python scripts/compile_data.py` is run and the live sheet's `gviz/tq` endpoint is unreachable or returns a response that does not parse as the expected format
- **THEN** the script exits with a non-zero status code and prints a descriptive error message to stderr, and neither `data/budget.json` nor `data/themes.json` is overwritten

#### Scenario: Repeated compilation of unchanged sheet data is byte-identical

- **WHEN** `python scripts/compile_data.py` is run twice in succession against a live sheet whose content has not changed between runs
- **THEN** the two resulting `data/budget.json` files are byte-for-byte identical

### Requirement: Compile theme definitions from the live Google Sheet

The compiler SHALL fetch the live Google Sheet's `gid=2136127994` tab via its public `gviz/tq` JSON endpoint and write the parsed theme-label-to-keywords mapping to `data/themes.json`.

#### Scenario: Successful compilation produces themes.json

- **WHEN** `python scripts/compile_data.py` is run with network access to the live Google Sheet
- **THEN** `data/themes.json` is written and contains an entry for every non-empty theme label present in the `gid=2136127994` tab

### Requirement: Scheduled recompilation with change-gated commits

A GitHub Actions workflow SHALL run the compiler on a schedule of every 30 minutes and SHALL also support manual triggering (`workflow_dispatch`). After each run, the workflow SHALL compare the newly compiled `data/budget.json` and `data/themes.json` against the versions currently committed on `main`. The workflow SHALL commit and push the new files only when at least one of them differs from the committed version. The workflow SHALL NOT create a commit when the compiled output is identical to what is already committed.

#### Scenario: Unchanged sheet data produces no commit

- **WHEN** the scheduled workflow runs and the live sheet's content has not changed since the last successful run
- **THEN** the compiled `data/budget.json` and `data/themes.json` are identical to the committed versions and the workflow completes successfully without creating a new commit

#### Scenario: Changed sheet data produces exactly one commit

- **WHEN** the scheduled workflow runs and at least one row or column in the live sheet has changed since the last successful run
- **THEN** the workflow commits the updated `data/budget.json` and/or `data/themes.json` to `main`, which in turn triggers the existing `jekyll-gh-pages.yml` deploy workflow

#### Scenario: Compile failure during a scheduled run blocks the commit

- **WHEN** the scheduled workflow runs and the compiler exits with a non-zero status
- **THEN** the workflow run is marked failed and no commit is created, leaving the previously deployed data untouched
