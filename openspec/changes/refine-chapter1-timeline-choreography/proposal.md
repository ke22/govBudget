## Why

Bucket 1 (`fix-responsive-story-acceptance-gaps`) closed regressions against the archived `stabilize-responsive-story-layout` baseline. This change is the first half of Bucket 2 — turning a set of Chapter-1-timeline choreography requests from `115MoneyDemoB-main/ISSUE-TRIAGE-v2.md` into concrete, testable behavior instead of raw notes. The growing timeline line and its cards currently activate at the exact same computed position with no visual lead time, the timeline has no distinct "complete" vs "still unfolding" terminal state, and the reveal mechanism is desktop-only even though a later request asks to extend it to tablet width.

## What Changes

- The `.timeline-row.item-card` reveal threshold used inside `updateTimelineMainLineFill()` leads each card's own position by a fixed 40px offset, so the growing line visually reaches a card's neighborhood before that card's `.story-card` fades in, instead of both happening at the identical scroll position.
- A new terminal marker element is added at the end of `.center-main-line`: while the line's fill is below 100% (story still unfolding, including after scrolling back up from completion), it renders as the line ending in a pulsing "?" mark; once the fill reaches 100% (the last `.timeline-row.item-node` is fully revealed), the marker morphs into an arrow. Scrolling back up below 100% reverts it to the pulsing "?" state.
- The Chapter 1 timeline reveal — currently gated to `window.innerWidth >= 1025` (JS) and `@media (min-width: 1025px)` (CSS, line-lead/reveal rules) — extends down to `641px`. The existing `@media (max-width: 1024px)` single-column stacking block is re-scoped to `max-width: 640px` only, and a new `@media (min-width: 641px) and (max-width: 1024px)` block adds an intermediate-width alternating-card layout distinct from both the phone single-column stack and the full desktop side-alternating layout.
- **Modified `responsive-storytelling-motion`**: the three-tier layout/motion model's requirement is extended so Chapter 1's timeline-reveal motion is explicitly confirmed active at intermediate width, not desktop-only, closing the gap between the archived spec's tier definitions and this new behavior.

## Capabilities

### New Capabilities

- `chapter1-timeline-motion-choreography`: the line-lead/card-trigger offset and the terminal-marker state machine (pulsing "?" vs. arrow, reversible) for the Chapter 1 timeline.

### Modified Capabilities

- `responsive-storytelling-motion`: extend the tier-to-motion mapping so Chapter 1's timeline reveal is confirmed active at intermediate width (641-1024px), not desktop-only (≥1025px).

## Impact

- Affected specs: `chapter1-timeline-motion-choreography` (new), `responsive-storytelling-motion` (modified)
- Affected code:
  - Modified: 115MoneyDemoB-main/index-v2.html
  - New: (none)
  - Removed: (none)
