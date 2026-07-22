## MODIFIED Requirements

### Requirement: Timeline card reveal leads the growing line by a fixed offset

At intermediate and wide widths, the Chapter 1 timeline SHALL reveal each `.timeline-row.item-card`'s story card only after the growing line's fill has passed 40 CSS pixels beyond that card's own reveal position, so the line visually arrives before the card follows, instead of both changing state at the identical scroll position. Additionally, each `.timeline-row.item-node`'s block node SHALL follow the same reveal pattern: hidden by default, revealed only after the line's fill tip passes 40 CSS pixels beyond the node's top edge.

The `updateTimelineMainLineFill()` function SHALL compute the viewport Y coordinate of the red line's fill tip (`fillTipViewportY`) and iterate over all `.timeline-row.item-card` and `.timeline-row.item-node` elements within `.center-timeline-container`, toggling `.timeline-card-revealed` or `.timeline-node-revealed` classes respectively when `fillTipViewportY >= rowRect.top + 40`.

The CSS SHALL hide unrevealed cards with `opacity: 0; pointer-events: none; transform: translateY(18px) rotate(-0.4deg)` and unrevealed nodes with `opacity: 0; transform: translateY(18px)`, both with `transition: opacity 320ms ease, transform 420ms cubic-bezier(0.16, 1, 0.3, 1)`. The existing forced `opacity: 1 !important; transform: none !important;` override on `.timeline-row.item-card .story-card` SHALL be replaced with the scroll-driven reveal behavior.

#### Scenario: Card reveals after the line has passed its position

- **WHEN** forward scrolling brings the line's fill to the point 40 CSS pixels before a given `.timeline-row.item-card`'s computed reveal position
- **THEN** that card remains hidden until the line's fill passes that point
- **AND** the card's story card fades in only once the 40-pixel lead has been crossed

#### Scenario: Node reveals after the line has passed its position

- **WHEN** forward scrolling brings the line's fill tip to 40 CSS pixels past a given `.timeline-row.item-node`'s top edge
- **THEN** that node's `.timeline-block-node` fades in from `opacity: 0; translateY(18px)` to `opacity: 1; translateY(0)`
- **AND** the transition uses `320ms ease` for opacity and `420ms cubic-bezier(0.16, 1, 0.3, 1)` for transform

#### Scenario: Reverse scroll un-reveals symmetrically

- **WHEN** the reader scrolls upward past a card or node's lead-adjusted reveal position
- **THEN** that element returns to its hidden state, recomputed fresh from current scroll position with no stale forward-scroll state

##### Example: card 3 of 6 during forward-then-reverse scroll

| Scroll direction | Line fill vs. card 3's 40px-adjusted threshold | Card 3 state |
| --- | --- | --- |
| Forward | Fill has not yet reached the threshold | Hidden (`.timeline-card-revealed` absent) |
| Forward | Fill passes the threshold | Revealed (`.timeline-card-revealed` added) |
| Reverse | Fill drops back below the threshold | Hidden again (`.timeline-card-revealed` removed), no stale class from the earlier forward pass |

### Requirement: Timeline terminal marker reflects completion state

The Chapter 1 timeline SHALL render a terminal marker at the end of `.center-main-line` that reflects the line's own fill progress: a pulsing "?" mark while the fill is below 100%, and a downward arrow ("↓") once the fill reaches 100% (the last `.timeline-row.item-node` fully revealed). The marker SHALL derive its state from the same fill-progress value the line itself uses, not a separately computed value, and SHALL reverse symmetrically on scroll-up.

The marker SHALL be a `<div class="timeline-terminus-mark" id="timeline-terminus-mark" aria-hidden="true">` element placed inside `.center-timeline-container` as a sibling of (not a child of) `.center-main-line`, positioned `absolute; left: 50%; bottom: 0; transform: translate(-50%, 50%)` so it sits at the bottom center of the timeline container without being clipped by `.center-main-line`'s `overflow: hidden`.

The "?" content SHALL be rendered via `::before { content: '?'; }` and the marker SHALL pulse using `@keyframes timeline-terminus-pulse` (scale 0.92→1.08, opacity 0.55→1.0, period 1.8s infinite ease-in-out). When the timeline fill reaches 100%, `.timeline-complete` class SHALL be toggled on, stopping the pulse animation and switching `::before` content to `'\2193'` (downward arrow).

#### Scenario: Incomplete timeline shows a pulsing question mark

- **WHEN** the timeline's fill progress is below 100%
- **THEN** the terminal marker renders as a circular badge containing a pulsing "?" character

#### Scenario: Completed timeline shows a downward arrow

- **WHEN** the timeline's fill progress reaches 100% (the last item-node fully revealed)
- **THEN** the terminal marker morphs from "?" into "↓" and the pulse animation stops

#### Scenario: Scrolling back up reverts the completed marker

- **WHEN** the reader scrolls upward from a completed (100%) state and fill progress drops below 100%
- **THEN** the terminal marker reverts from the arrow back to the pulsing "?" mark
