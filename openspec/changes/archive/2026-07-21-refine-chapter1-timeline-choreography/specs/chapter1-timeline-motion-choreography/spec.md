## ADDED Requirements

### Requirement: Timeline card reveal leads the growing line by a fixed offset

At intermediate and wide widths, the Chapter 1 timeline SHALL reveal each `.timeline-row.item-card`'s story card only after the growing line's fill has passed 40 CSS pixels beyond that card's own reveal position, so the line visually arrives before the card follows, instead of both changing state at the identical scroll position.

#### Scenario: Card reveals after the line has passed its position

- **WHEN** forward scrolling brings the line's fill to the point 40 CSS pixels before a given `.timeline-row.item-card`'s computed reveal position
- **THEN** that card remains hidden until the line's fill passes that point
- **AND** the card's story card fades in only once the 40-pixel lead has been crossed

#### Scenario: Reverse scroll un-reveals symmetrically

- **WHEN** the reader scrolls upward past a card's lead-adjusted reveal position
- **THEN** that card returns to its hidden state, recomputed fresh from current scroll position with no stale forward-scroll state

##### Example: card 3 of 6 during forward-then-reverse scroll

| Scroll direction | Line fill vs. card 3's 40px-adjusted threshold | Card 3 state |
| --- | --- | --- |
| Forward | Fill has not yet reached the threshold | Hidden (`.timeline-card-revealed` absent) |
| Forward | Fill passes the threshold | Revealed (`.timeline-card-revealed` added) |
| Reverse | Fill drops back below the threshold | Hidden again (`.timeline-card-revealed` removed), no stale class from the earlier forward pass |

### Requirement: Timeline terminal marker reflects completion state

The Chapter 1 timeline SHALL render a terminal marker at the end of `.center-main-line` that reflects the line's own fill progress: a pulsing "?" mark while the fill is below 100%, and an arrow once the fill reaches 100% (the last `.timeline-row.item-node` fully revealed). The marker SHALL derive its state from the same fill-progress value the line itself uses, not a separately computed value, and SHALL reverse symmetrically on scroll-up.

#### Scenario: Incomplete timeline shows a pulsing question mark

- **WHEN** the timeline's fill progress is below 100%
- **THEN** the terminal marker renders as a line ending in a pulsing "?" mark

#### Scenario: Completed timeline shows an arrow

- **WHEN** the timeline's fill progress reaches 100% (the last item-node fully revealed)
- **THEN** the terminal marker morphs into an arrow

#### Scenario: Scrolling back up reverts the completed marker

- **WHEN** the reader scrolls upward from a completed (100%) state and fill progress drops below 100%
- **THEN** the terminal marker reverts from the arrow back to the pulsing "?" mark
