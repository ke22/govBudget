# project-card-keyword-tags Specification

## Purpose

`database-v2.html` project cards must display keyword tags sourced from the live spreadsheet's `關鍵字` column, surfacing data that is already fetched and used for filtering but never shown to the user.

## Requirements

### Requirement: Project cards display keyword tags from spreadsheet data

Each rendered `.project-block` card in `database-v2.html` SHALL display one tag chip for every non-empty, trimmed segment of that project's `關鍵字` field value, split on the Chinese comma `、`. The field SHALL be read from the same live-fetched row data already used for keyword filtering (`matchKeywordCheck`) — no tag data SHALL be hardcoded.

#### Scenario: Project with multiple keywords shows one chip per keyword

- **WHEN** a project's `關鍵字` field is `國家行政、人事行政、主計、資訊、警政`
- **THEN** the rendered card shows exactly 5 tag chips, reading 國家行政 / 人事行政 / 主計 / 資訊 / 警政 in that order

##### Example: split and trim behavior

| `關鍵字` value | Rendered chips |
| --- | --- |
| `交通設備` | `交通設備` (1 chip) |
| `文化、大眾傳播、新聞聯繫` | `文化`, `大眾傳播`, `新聞聯繫` (3 chips) |
| `` (empty string) | (0 chips) |
| `null`/missing field | (0 chips) |

#### Scenario: Empty keyword field renders no chips

- **WHEN** a project's `關鍵字` field is empty or missing
- **THEN** the rendered card shows zero tag chips and no placeholder chip is rendered in its place

#### Scenario: Tag chips are visually distinct from interactive filter pills

- **WHEN** a card's tag chips are rendered
- **THEN** they use a chip style visually derived from `.pill-btn` (same pill shape, hairline border) but without hover/active/selected interactive states, and clicking a chip SHALL NOT trigger any filter action
