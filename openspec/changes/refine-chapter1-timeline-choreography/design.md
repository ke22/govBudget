## Context

`115MoneyDemoB-main/index-v2.html`'s Chapter 1 timeline is driven by `updateTimelineMainLineFill()`: a pure scroll-percent function that sets `--timeline-progress` on `#center-main-line-fill` and independently computes each `.timeline-row.item-card`'s own reveal threshold from `cardRect.top - rect.top + cardRect.height * 0.45`. The reveal (both the line-fill CSS variable write and the per-card threshold check) is gated to `window.innerWidth >= 1025` in JS and `@media (min-width: 1025px)` in CSS — below that, cards never get `.timeline-card-revealed` and the `@media (max-width: 1024px)` block (a single shared block for the whole ≤1024px range) forces single-column stacking instead. There is no terminal-end marker of any kind on `.center-main-line` today.

This design covers three of the four Chapter-1-timeline items from `ISSUE-TRIAGE-v2.md` Bucket 2 (the fourth, extending the desktop-only reveal, is folded in as the breakpoint-widening decision below).

## Goals / Non-Goals

**Goals:**

- Make the line visually "arrive" at a card's neighborhood before that card reveals, instead of both happening at the same scroll position.
- Give the timeline's end a state that reflects completion (arrow) vs. still-unfolding (pulsing "?"), reversible on scroll-up.
- Extend the existing desktop-only reveal down to 641px without breaking the phone-only single-column stacking that must remain for ≤640px.

**Non-Goals:**

- No changes to Chapter 2 or Chapter 3 (tracked separately in `refine-chapter2-chapter3-reveal-choreography`).
- No change to the line-fill percent formula itself (`--timeline-progress` stays a pure function of overall scroll position) — only the per-card *reveal threshold* changes.
- No change to `.timeline-block-node`/`.item-node` markers themselves (always-visible, unaffected).

## Decisions

### 40px line-lead: offset the card's own reveal threshold, not the line's fill formula

Two options: (a) add a visual-only offset to where `--timeline-progress` is rendered (e.g., a transform on the fill bar itself) while leaving each card's reveal threshold unchanged; (b) leave the line's own fill formula untouched and instead add a fixed 40px to each card's `cardOffset` before converting it to `revealAt`, so the card's trigger threshold sits 40px further down the track than the card's own position, and the card only reveals once the line's continuous progress has already passed that point.

**Chosen: (b).** The line's fill is a single continuous progress bar with no natural "per-node" segmentation to offset visually without introducing stepping artifacts; adding 40px to the per-card threshold produces the same perceived effect (line arrives at the card's position, then the card follows shortly after) using the mechanism that already varies per-card (`cardOffset`), and needs no new CSS transform or motion synchronization.

### Terminal marker: single element with two CSS states, driven by fill percent, not a fixed scroll event

Two options: (a) toggle the marker's state from a scroll-position check independent of the line-fill logic; (b) drive it from the same `--timeline-progress` value already computed in `updateTimelineMainLineFill()` — arrow state when progress >= 100, pulsing-"?" state otherwise.

**Chosen: (b).** Reusing the already-computed progress value (the same principle used by Bucket 1's fixes: tie dependent visual state to the value it actually depends on, not a second independent calculation) guarantees the marker can never show "arrow" while the line is visually incomplete, and reverses correctly for free when scrolling back up since progress is recomputed fresh every frame.

### Intermediate breakpoint: re-scope compact stacking to ≤640px and add a dedicated 641-1024px layout, not widen the desktop block directly

Two options: (a) simply change `min-width: 1025px` to `min-width: 641px` on the existing desktop reveal block, letting the existing `max-width: 1024px` stacking block fight it via specificity/order; (b) narrow the existing single-column stacking block's own query to `max-width: 640px`, widen the reveal-gate query/JS condition to `641px`, and add a new `@media (min-width: 641px) and (max-width: 1024px)` block with its own alternating-card layout tuned for the narrower tablet width (less horizontal offset than desktop's presumably-wider `margin-left: 40%`-style split, matching the pattern already used for Chapter 2's Gantt frame in Bucket 1).

**Chosen: (b).** Two overlapping `max-width`/`min-width` queries at the same breakpoint boundary (option a) is exactly the kind of fragile cascade-order dependency this file's own comments already warn about elsewhere; explicit, non-overlapping ranges are self-documenting and match the convention already established for Chapter 2/3's intermediate overrides.

## Implementation Contract

- **Behavior**: (1) at desktop and intermediate width (≥641px), each `.timeline-row.item-card` reveals once the line's progress has passed 40px beyond that card's own reveal position (not simultaneously); (2) the terminal marker at the end of `.center-main-line` shows a pulsing "?" whenever `--timeline-progress` < 100%, and an arrow when it reaches 100%, symmetric on scroll-up/scroll-down; (3) the timeline's progressive reveal (line-fill sync, card reveal, alternating left/right card layout) is active at 641-1024px as well as ≥1025px, while ≤640px keeps its existing single-column, non-progressive stacking unchanged.
- **Interface/data shape**: no new JS globals; the existing `--timeline-progress` custom property and `.timeline-card-revealed` class remain the only state carriers, plus one new class (e.g. `.timeline-complete`) toggled on the terminal-marker element from the same function.
- **Failure modes**: none beyond existing — this is presentational; if `window.matchMedia` is unavailable the reveal simply falls back to whatever the existing unconditional branch already does (no new failure surface introduced).
- **Acceptance criteria**: at 768x1024 and 1024x768 (new intermediate range) and at 1366x768 (existing desktop range), scrolling forward shows each card's `.story-card` fade in only after the line's rendered fill has visually passed 40px beyond that card's position, not simultaneously; the terminal marker shows the arrow only once the last `.timeline-row.item-node` is fully revealed (progress >= 100%) and reverts to the pulsing "?" immediately on scrolling back up past that point; at 390x844 and 430x932 (≤640px, phone), the timeline remains single-column and non-progressive exactly as before (no regression).
- **Scope boundaries**: in scope — `.center-timeline-container`/`.timeline-row`/`.center-main-line`/`.center-main-line-fill` CSS and `updateTimelineMainLineFill()` JS only, within `115MoneyDemoB-main/index-v2.html`. Out of scope — any other chapter, the line-fill percent formula itself, `.timeline-block-node` styling.

## Risks / Trade-offs

- [A fixed 40px lead is a visual constant, not proportional to viewport height] → Mitigation: 40px is a small, deliberately subtle offset relative to typical card heights (hundreds of px), so its absolute-px nature is unlikely to look wrong at any of the supported widths; revisit if visual QA disagrees.
- [Adding a new 641-1024px alternating-card layout is new visual design, not just a resize] → Mitigation: scope it conservatively (reuse the desktop pattern's proportions, scaled down) rather than inventing a new visual treatment, minimizing surprise.
- [Two `max-width`/`min-width` queries changing at once could momentarily leave a width unhandled if edited out of order] → Mitigation: implement the 640px narrowing and the 641px widening in the same task/commit, verified together before either ships independently.
