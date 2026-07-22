# editorial-type-and-color-hierarchy Specification

## Purpose

Chinese heading wrapping at authored phrase boundaries, plus a constrained set of editorial typography and UI color roles, so headings read as intended phrases and non-data UI colors stay visually distinct from chart data colors.

## Requirements

### Requirement: Critical Chinese headings wrap at authored phrase boundaries

Critical report and chapter headings SHALL expose authored phrase boundaries. Each phrase SHALL remain unbroken internally, and wrapping SHALL occur between phrases when the complete heading does not fit on one line.

#### Scenario: Chapter 2 heading wraps semantically

- **WHEN** `不是只有今年晚，但今年最極端` requires two lines
- **THEN** the first line contains `不是只有今年晚，`
- **AND** the second line contains `但今年最極端`

#### Scenario: Chapter 3 heading wraps semantically

- **WHEN** `晚審影響新興預算無法動支` requires two lines
- **THEN** the first phrase is `晚審影響`
- **AND** the second phrase is `新興預算無法動支`

#### Scenario: Phrase fits compact container

- **WHEN** each critical heading is rendered at 390 CSS pixels of viewport width
- **THEN** no authored phrase exceeds the heading container or causes horizontal scrolling

### Requirement: Editorial typography uses five roles

The report SHALL use exactly five editorial typography roles for report display, chapter heading, chart or panel heading, body, and caption or label. Role sizes SHALL use bounded `clamp()` values so supported viewport widths transition fluidly without exceeding the documented role minimums or caps. Compact chapter headings SHALL remain at least 1.75rem, intermediate chapter headings SHALL target 2rem, and wide chapter headings SHALL not exceed 2.5rem. Heading corrections MUST NOT reduce the established body role globally.

#### Scenario: Typography changes across layout bands

- **WHEN** the same chapter heading is rendered at 640, 641, 1024, and 1025 CSS pixels
- **THEN** it uses the documented compact, intermediate, or wide chapter-heading role
- **AND** adjacent body copy retains the body role across all widths

#### Scenario: Fluid role sizing stays bounded

- **WHEN** a viewport changes continuously between 390 and 1440 CSS pixels
- **THEN** typography assigned to a shared editorial role changes within that role's documented `clamp()` bounds
- **AND** no breakpoint introduces an unbounded jump or a sixth editorial typography role

### Requirement: Chinese body and annotation text retain readable minimums

Primary Chinese body copy SHALL compute to at least 16 CSS pixels at every supported viewport. Chart annotations and captions SHALL compute to at least 12 CSS pixels, with 13 CSS pixels used when space permits. Text at caption size SHALL use regular or medium weight and MUST NOT use Thin or Light weights. Chinese body text SHALL prioritize line height and paragraph measure over expanded letter spacing.

#### Scenario: Compact typography remains readable

- **WHEN** the report is rendered at 390 x 844 CSS pixels
- **THEN** primary Chinese body copy computes to at least 16 CSS pixels
- **AND** chart annotations and captions compute to at least 12 CSS pixels
- **AND** caption text uses a regular or medium font weight

### Requirement: UI colors use six non-data roles

The report SHALL limit non-data UI colors to deep canvas, paper surface, primary ink, inverse ink, seal-red accent, and muted text or border roles. Seal red SHALL be reserved for editorial emphasis, active navigation, and critical status. Yellow, teal, blue, and chart category colors MUST NOT be introduced for unrelated controls or decorative headings.

#### Scenario: UI and data palettes remain distinct

- **WHEN** headings, navigation, buttons, story cards, and charts are inspected
- **THEN** non-data UI elements use only the six editorial color roles
- **AND** the existing chart category palette remains available to encode data categories or parties

### Requirement: Affected typography and color declarations are role-based

Affected headings, paragraphs, navigation states, and controls SHALL obtain font size, weight, line height, and color from shared role classes or tokens. Conflicting inline typography and color declarations MUST be removed from those elements.

#### Scenario: Source role audit

- **WHEN** the review copy source is inspected after implementation
- **THEN** affected headings and controls contain no inline declaration that overrides their assigned typography or UI color role
- **AND** chart data marks retain their semantic category tokens
