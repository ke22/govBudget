## ADDED Requirements

### Requirement: Chapter 2 card 1 shows an empty chart frame distinct from card 2's axis highlight

Chapter 2's first story card SHALL make the Gantt chart panel and its background grid visible in a muted, no-emphasis state, without the X-axis or Y-axis opacity that is reserved for card 2. Card 2 SHALL continue to add the X-axis and Y-axis highlight exactly as it does today, so the two cards read as visually distinct states rather than everything appearing simultaneously.

#### Scenario: Card 1 shows the frame without axis emphasis

- **WHEN** the reader reaches Chapter 2's first story card
- **THEN** the chart panel frame and background grid are visible
- **AND** neither the X-axis nor the Y-axis is highlighted

#### Scenario: Card 2 adds the axis highlight

- **WHEN** the reader reaches Chapter 2's second story card
- **THEN** the X-axis and Y-axis highlight becomes visible in addition to the frame and grid already shown on card 1

### Requirement: Chapter 3's grey total-execution bar has a distinct reveal from the colored bars

`#ch3-bar-total-grey` SHALL use a reveal transition (duration and/or easing) distinguishable from the shared transition every other `.ch3-single-bar-layer` bar uses, so the grey base layer visibly establishes itself as its own beat rather than appearing identically to the colored category bars.

#### Scenario: Grey bar reveal reads as distinct

- **WHEN** Chapter 3's chart transitions into the step that reveals `#ch3-bar-total-grey`
- **THEN** its width/opacity transition is visibly different (duration or easing) from the transition used by the colored `.ch3-single-bar-layer` bars

### Requirement: Chapter 3's last card and chart move together during exit

The Chapter 3 sticky chart box (`#ch3-sticky-box-wrapper`) SHALL translate upward in lockstep with the last story card's (`#ch3-card-five-trigger`) position as it scrolls toward the chapter's end, using a single geometry-derived offset recomputed every frame, so the chart and the last card never visually overlap in either scroll direction.

#### Scenario: Chart follows the last card during forward scroll

- **WHEN** the reader scrolls forward and the last Chapter 3 story card's top approaches the sticky chart box's top
- **THEN** the sticky chart box translates upward by the same distance the card has closed, capped at the sticky box's own height

#### Scenario: Reverse scroll restores the chart's position symmetrically

- **WHEN** the reader scrolls back upward after the chart has translated upward
- **THEN** the chart's translation is recomputed fresh from the last card's current position, with no stale offset from the earlier forward scroll

##### Example: forward-then-reverse scroll sequence

| Step | Last card top vs. chart top | `--ch3-exit-offset` | Chart translateY |
| --- | --- | --- | --- |
| 1. Forward, card still below chart | Card top > chart top | 0px | 0 (no translation) |
| 2. Forward, card has closed 40px | Card top = chart top - 40px | 40px | -40px |
| 3. Forward, card closed beyond wrapper height | Card top = chart top - (wrapper height + 20px) | capped at wrapper height | -(wrapper height) |
| 4. Reverse, back to step 2's position | Card top = chart top - 40px | 40px | -40px (matches step 2 exactly, no stale value from step 3) |
