## ADDED Requirements

### Requirement: History story cards remain readable until past 50% viewport height

The Chapter 2 mapping-history story cards SHALL maintain an opacity of at least 0.85 (fully readable text) while any part of the card is at or below the 50% viewport height mark. The opacity fade-out SHALL begin only after the card's top edge rises above the 50% viewport height threshold.

The scroll handler that computes story card opacity SHALL use `viewportHeight * 0.50` as the start threshold (where fade begins) and `viewportHeight * 0.30` as the end threshold (where opacity reaches 0), ensuring that cards at the center of the screen are always legible.

#### Scenario: Card fully readable at 50% viewport height

- **WHEN** a Chapter 2 history story card's top edge is at or below 50% of the viewport height
- **THEN** the card's opacity is >= 0.85 and the text is fully legible

#### Scenario: Card begins fading above 50% viewport height

- **WHEN** a Chapter 2 history story card's top edge rises above 50% of the viewport height
- **THEN** the card's opacity begins decreasing proportionally from 1.0 toward 0.0

#### Scenario: Card fully transparent above 30% viewport height

- **WHEN** a Chapter 2 history story card's top edge is at or above 30% of the viewport height
- **THEN** the card's opacity is 0 and pointer-events are set to none

##### Example: opacity at different scroll positions

| Card top edge (relative to viewport height) | Expected opacity | Readable? |
| --- | --- | --- |
| 70% vh (below center) | 1.0 | Yes |
| 50% vh (at threshold) | 1.0 | Yes |
| 40% vh (between thresholds) | 0.5 | Partially |
| 30% vh (at end threshold) | 0.0 | No |
| 20% vh (above end) | 0.0 | No |
