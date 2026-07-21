# mobile-scrollytelling-card-motion Specification

## Purpose

`index-v2.html`'s mobile Chapter-2/3 story cards enter and exit via continuous bottom-to-top scroll motion, synced to the active scroll step, so mobile motion matches the direction of travel that desktop's normal-scroll-flow cards already exhibit. The current mechanism pins the chart as a top band and lets cards flow in the reading zone below it; this superseded an earlier in-place opacity/translate fade-swap attempt that could not produce continuous travel.

## Requirements

### Requirement: Mobile Chapter-2/3 chart pins as a top band with cards scrolling below

On `index-v2.html` at phone/tablet widths (`max-width: 968px`), Chapter-2 (Gantt) and Chapter-3 (stacked bar) SHALL pin the chart as an opaque top band occupying roughly the upper 58dvh, and the `.gantt-card-rebuilt` story cards SHALL flow in the lower reading zone (~42dvh) in normal scroll order, so the active card transitions via continuous bottom-to-top travel instead of an in-place opacity/visibility fade or a small in-place translate swap.

#### Scenario: Cards travel bottom-to-top continuously

- **WHEN** the reader scrolls through Chapter-2 or Chapter-3 on a phone
- **THEN** each story card enters from the bottom of the lower reading zone and moves upward continuously as scrolling continues, exiting at the top — with no full-viewport black gap between two consecutive cards

#### Scenario: Chart and its describing card visible together

- **WHEN** Chapter-2 card 2 ("中央政府總預算案原則上應於前一年度底完成審議…") is in the lower reading zone
- **THEN** the pinned top band already shows the Gantt bars populated, so the chart and the card describing it are legible at the same time

#### Scenario: Card never overlaps the pinned chart band

- **WHEN** any story card is scrolling through the lower reading zone
- **THEN** it stays below the pinned top band and never visually overlaps the chart

#### Scenario: The final step-9 card exits with the same motion, not an instant disappearance

- **WHEN** the user scrolls past Chapter 2's step 9 (the last history-photo step) on mobile
- **THEN** the step-9 card exits upward through the lower reading zone using the same continuous motion as every other step, rather than disappearing abruptly together with its photo

#### Scenario: Only one card is interactive/visible at a time

- **WHEN** any step's card is outside the active lower-reading-zone position
- **THEN** that card SHALL NOT intercept pointer events or be exposed to assistive technology as visible, consistent with step-exclusivity (only the active step's card is interactive)

#### Scenario: Desktop scrollytelling unchanged

- **WHEN** Chapter-2/3 is viewed at desktop width (>= 969px)
- **THEN** the existing desktop scrollytelling layout and card motion are unchanged
