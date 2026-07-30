## ADDED Requirements

### Requirement: Chart categorical colors are named tokens, not literal hex values

The system SHALL define five categorical chart tokens in `:root`: `--chart-cat-neutral` (`#7A6F5D`), `--chart-cat-impact` (alias of `var(--danger)`), `--chart-cat-new` (`#3F7D5C`), `--chart-cat-extend` (`#3B5A80`), and `--chart-cat-reserve` (alias of `var(--accent)`). The `.ch3-color-grey`, `.ch3-color-red`, `.ch3-color-teal`, `.ch3-color-blue`, and `.ch3-color-orange` rules, the three chapter-3 legend dot inline styles, and the chapter-3 chart title's decorative accent border SHALL each reference the corresponding `--chart-cat-*` token instead of a literal hex value.

#### Scenario: Stacked bar chart and its legend read from the same tokens

- **WHEN** the chapter-3 stacked bar chart and its legend are rendered
- **THEN** each of the 5 category colors (neutral, impact, new, extend, reserve) matches its corresponding `--chart-cat-*` token value exactly
- **AND** the legend dot for a given category renders the identical color to that category's bar segment

#### Scenario: No literal category hex values remain outside token definitions

- **WHEN** the file is searched for the literal values `#7A6F5D`, `#3F7D5C`, and `#3B5A80`
- **THEN** each literal appears exactly once, inside its `--chart-cat-*` token definition in `:root`, and nowhere else

### Requirement: Chart categorical palette preserves 5-way legibility

The chart categorical palette SHALL use 5 visually distinguishable hues (not a single hue varied only by lightness/opacity), so that all 5 categories remain distinguishable from one another in the stacked bar chart at mobile segment widths.

#### Scenario: Categories remain distinguishable at narrow widths

- **WHEN** the chapter-3 stacked bar chart is viewed at a 390px-wide mobile viewport
- **THEN** each of the 5 category segments is visually distinguishable from its neighbors by hue, not only by position or lightness

### Requirement: On-dark comparison-chart labels remain legible

The chapter-4 comparison chart's value labels (`.pyramid-align-row .val-num`, left and right variants) SHALL use colors with sufficient contrast against the page's dark background (`--bg-deep`), distinct from the muted `--chart-cat-*` fill tokens used for chapter-3's bar segments.

#### Scenario: Value labels stay legible against the dark page background

- **WHEN** the chapter-4 comparison chart's value labels are rendered against `--bg-deep`
- **THEN** the left (excluded-group) label renders in a bright red distinguishable from the dark background
- **AND** the right (included-group) label renders in a bright gold/brass distinguishable from the dark background
