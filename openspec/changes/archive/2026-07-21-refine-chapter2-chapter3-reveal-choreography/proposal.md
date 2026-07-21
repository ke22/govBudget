## Why

This is the second half of Bucket 2 from `115MoneyDemoB-main/ISSUE-TRIAGE-v2.md` — the Chapter 2/3 reveal-choreography items, split out from Chapter 1's timeline work (`refine-chapter1-timeline-choreography`) so each change stays reviewable. Chapter 2's chart currently shows nothing on card 1 and reveals its whole frame plus both axes simultaneously on card 2; Chapter 3's grey "total execution" bar shares a generic fade/grow with every other bar layer instead of a distinct reveal; Chapter 3's sticky chart box is currently top-anchored (a later unconditional CSS rule overrides the earlier centering declarations at every breakpoint) though the reader wants it to feel vertically centered; and Chapter 3's intro text visually waits for Chapter 2's fixed stage to clear as an incidental side effect rather than an explicit, documented behavior. A fifth item (Chapter 3's last card and chart "scrolling up together") was investigated and found already satisfied by an existing mechanism — see Non-Goals.

## What Changes

- Chapter 2 card 1 now shows an empty/gray chart frame (panel + grid, no axis emphasis); axis highlighting remains deferred specifically to card 2, so the two states are visually distinct instead of everything appearing at once.
- `#ch3-bar-total-grey` gets its own reveal treatment (distinct timing/easing from the shared `.ch3-single-bar-layer` fade/grow every other bar uses), so the grey base layer visibly establishes itself before the colored bars grow on top of it.
- At `≥1025px`, `#ch3-sticky-box-wrapper`'s content is centered within the header-safe viewport band (`--chart-stage-height`, below `--chart-stage-top`) by overriding the specific rule that currently wins the cascade and top-anchors it — the box's own top offset at `--chart-stage-top` and its clearance-enforcing padding are untouched, so the already-shipped header-clearance guarantee is not broken. **This is a deliberate, narrower resolution of the original "center it in the viewport" request** — full unconditional viewport centering (moving the top anchor itself) was rejected because it would let the fixed header overlap the chart on short viewports (see Design decision below).
- Chapter 3's intro text gains an explicit reveal class/transition gated on `history-exit-complete` — a class Chapter 2's `updateHistoryExit()` already toggles the instant its exit fade actually finishes — replacing today's incidental, much-coarser "waits for the whole chapter to scroll past" timing with a documented, testable one tied to the state it should actually depend on.

## Non-Goals (optional)

- No opacity-fade port of Chapter 2's `updateHistoryExit()` pattern to Chapter 3's last card. Investigated and found unnecessary: Chapter 3's chart is `position: sticky` and already moves in lockstep with the last card via the existing `--ch3-exit-offset` transform (recomputed every frame from live geometry, capped at the wrapper's own height), unlike Chapter 2's `position: fixed` backdrop which genuinely needed an opacity fade because it never moves on its own. This item is verification-only (confirm the existing mechanism holds at the target viewports) plus one ADDED spec requirement documenting the already-correct behavior.

## Capabilities

### New Capabilities

- `chapter2-chapter3-reveal-refinements`: Chapter 2's card-1 gray/empty chart state, Chapter 3's distinct grey-bar reveal, and a documented requirement for Chapter 3's already-correct last-card/chart exit coordination.

### Modified Capabilities

- `chart-viewport-clearance`: add a clarifying scenario that vertical distribution of slack within the already-cleared region is a presentation choice the spec's clearance minimums don't constrain — no change to the normative clearance requirements themselves.
- `chapter-visual-exit`: add a requirement that Chapter 3's intro text reveal is explicitly gated on the `history-exit-complete` state that already governs Chapter 2's exit fade completion, instead of relying on incidental scroll-position side effects.

## Impact

- Affected specs: `chapter2-chapter3-reveal-refinements` (new), `chart-viewport-clearance` (modified), `chapter-visual-exit` (modified)
- Affected code:
  - Modified: 115MoneyDemoB-main/index-v2.html
  - New: (none)
  - Removed: (none)
