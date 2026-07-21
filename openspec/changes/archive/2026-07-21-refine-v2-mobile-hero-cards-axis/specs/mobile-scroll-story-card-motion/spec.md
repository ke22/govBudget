## ADDED Requirements

### Requirement: Mobile Chapter-2/3 chart pins as a top band with cards scrolling below

On phone/tablet widths (`max-width: 968px`), Chapter-2 (Gantt) and Chapter-3 (stacked bar) SHALL pin the chart as an opaque top band occupying roughly the upper 58dvh, and the `.gantt-card-rebuilt` story cards SHALL flow in the lower reading zone (~42dvh) in normal scroll order, replacing the previous full-screen-pinned in-place opacity/translate fade-swap.

#### Scenario: Cards travel bottom-to-top continuously

- **WHEN** the reader scrolls through Chapter-2 or Chapter-3 on a phone
- **THEN** each story card enters from the bottom of the lower reading zone and moves upward continuously as scrolling continues, exiting at the top — with no full-viewport black gap between two consecutive cards

#### Scenario: Chart and its describing card visible together

- **WHEN** Chapter-2 card 2 ("中央政府總預算案原則上應於前一年度底完成審議…") is in the lower reading zone
- **THEN** the pinned top band already shows the Gantt bars populated, so the chart and the card describing it are legible at the same time

#### Scenario: Card never overlaps the pinned chart band

- **WHEN** any story card is scrolling through the lower reading zone
- **THEN** it stays below the pinned top band and never visually overlaps the chart

#### Scenario: Desktop scrollytelling unchanged

- **WHEN** Chapter-2/3 is viewed at desktop width (>= 969px)
- **THEN** the existing desktop scrollytelling layout and card motion are unchanged
