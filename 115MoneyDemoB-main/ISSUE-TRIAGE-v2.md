# Issue Triage — `index-v2.html` new backlog (2026-07-21)

Source: raw observation notes pasted into chat after the `stabilize-responsive-story-layout` ad-hoc follow-up round (hero artwork swap, stamp reposition, desktop timeline reveal). The notes were pasted three times with duplicates and some garbled/incomplete HTML. This table deduplicates them into one list, following the four-bucket framework already recorded in `HANDOFF-v2.md`.

**Read before acting:** several rows below are marked `⚠ unconfirmed` — I inferred viewport/component/current-behavior from the note's wording and its grouping in the pasted text, not by reading the live DOM/CSS. Verify those against the actual code or a live screenshot before writing them into a `proposal.md`. Rows without that marker are close to verbatim from the notes.

## Bucket A — Acceptance gaps (regressions against the archived `stabilize-responsive-story-layout` baseline)

Target change: `fix-responsive-story-acceptance-gaps`

| ID | Viewport | Component | Current | Expected | Severity |
|---|---|---|---|---|---|
| HERO-STAMP-01 | ≤1024 (compact+intermediate) | `.hero-stamp-wrap` vs. hero title | Risk of the stamp overlapping the title (per note "don't cover title") | Stamp SHALL remain geometrically disjoint from title/subtitle/dek at all supported widths, per the already-archived `responsive-editorial-hero` spec's no-overlap requirement | P1 |
| CH2-LAYOUT-01 ⚠ unconfirmed | 641–1024 (intermediate) — inferred from "follow desktop concept" phrasing, not stated explicitly | `.center-timeline-container` (or the Chapter-2 Gantt — name ambiguous, verify which) | Bars crowd together; Y-axis runs outside the chart's own container/boundary | Layout matches the desktop concept: bars contained, axis fully inside the chart boundary, no crowding — this is what `chart-viewport-clearance`'s "Chart panels fit remaining viewport height" already requires | P1 |
| CH2-CARD-TIMING-01 ⚠ unconfirmed | Not stated — assume applies wherever Chapter 2's step sequence runs | Chapter 2 last story card entrance | Last story card enters too early, before the last history image has finished showing | Last story card SHALL wait for the last history image to appear before it starts scrolling in | P2 |
| CH2-CH3-OVERLAP-01 ⚠ unconfirmed | Not stated | Last Chapter-2 story card vs. Chapter-3 chart | The two can end up visually overlapping when the transition state is wrong | When they would otherwise overlap, the outgoing card/chart SHALL scroll up out of the way instead of overlapping | P1 |

## Bucket B — New scroll choreography (motion/sequencing, not required by the archived baseline)

Target change: `refine-story-scroll-choreography`. All items below are stated for `≥1025` (desktop) unless noted.

| ID | Viewport | Component | Current | Expected | Severity |
|---|---|---|---|---|---|
| TIMELINE-LEAD-01 | ≥1025 | `#center-main-line-fill` vs. `.timeline-row .item-node` | Line fill presumably reaches a node exactly as the node's reveal starts | Line SHALL visually appear/extend 40px *before* the item-node's start point | P2 |
| TIMELINE-TRIGGER-01 | ≥1025 | `.timeline-row .item-card` | Card trigger point tied to exact line/node alignment (same mechanism as above) | Card SHALL be triggered when the line passes 40px *before* reaching the card, not when it's exactly at the card | P2 |
| TIMELINE-TERMINAL-01 | ≥1025 | `#center-main-line-fill` end cap | Line end renders as a plain line throughout | Line's leading end SHALL render as an arrow while progressing; at the very last point, the arrow SHALL revert to a plain line and a small pulsing question mark SHALL appear at the terminus | P2 |
| CH2-STAGED-REVEAL-01 | Grouped with the ≥1025 items in the notes ⚠ unconfirmed whether desktop-only | `.chapter-section-rebuilt.rebuilt-step-2` chart | Chart bars appear directly per current step logic | On Chapter-2 card 1 trigger: show an empty gray placeholder chart. On card 2 trigger: highlight the X and Y axes | P2 |
| CH3-STICKY-CENTER-01 | Not stated ⚠ could be a preference, not a bug — verify current position first | `#ch3-sticky-box-wrapper` | Positioned per the existing sticky/header-clearance logic (top-anchored per the archived `chart-viewport-clearance` spec) | Box SHALL sit vertically centered in the viewport | P2/P3 (resolve ambiguity first) |
| CH3-GREY-BAR-ANIM-01 | Not stated | `#ch3-bar-total-grey` | No animation beyond whatever the existing bar-growth step transition does | Unclear — note reads "I want [this element]. Also have animation with th[is]" and cuts off mid-sentence. Best guess (from the earlier separate triage pass): a reveal animation on the grey total-bar layer specifically. **Not confident enough to spec — ask the user to finish the sentence.** | Needs spec |
| CH2-CLOSING-PARA-01 | Not stated | Chapter 2 closing paragraph | Unclear current trigger point | Closing paragraph SHALL only appear after the last story card *and* the chart have both scrolled out of the viewport | P2 |

## Bucket C — Visual polish (not blocking comprehension/interaction)

Target change: `polish-story-page-visual-hierarchy`

| ID | Viewport | Component | Current | Expected | Severity |
|---|---|---|---|---|---|
| SCROLL-IND-CONTRAST-01 | ≥1025 | `.scroll-indicator` | Contrast described as insufficient (no specific numbers given) | Increase contrast against the hero background | P3 |
| SCROLL-IND-ALIGN-01 | <735 (note: not one of the project's usual 640/768/1024 breakpoints — confirm whether this should snap to an existing one) | `.scroll-indicator` | Not centered | Center-aligned | P3 |
| HERO-STAMP-02 | Not stated, likely all widths | `.hero-stamp` | Current size | Larger, and center-aligned — **distinct from HERO-STAMP-01 above**: this is a size/alignment preference, not the overlap bug | P3 |
| FOOTER-SEPARATION-01 | Not stated | Footer vs. body | Footer blends into body background | Visually distinguish the footer from the body (border, background shift, or spacing) | P3 |

## Bucket D — Needs specification before any change is written

Not ready for a `proposal.md`. Ask the user to finish/clarify these before acting:

| Note as pasted | Why it's not actionable yet |
|---|---|
| "I want `#ch3-bar-total-grey`. Also have animation with th…" | Sentence cuts off mid-word ("th[is]?") — what animation, triggered by what, is unstated. Tracked provisionally as CH2-GREY-BAR-ANIM-01 above but flagged unconfident. |
| "Cover chap 3" | No surrounding context anywhere in the notes. Could mean "add a cover/transition before Chapter 3," "something is incorrectly covering Chapter 3," or is an unrelated leftover fragment. Cannot guess responsibly. |

## Open cross-cutting questions before writing `proposal.md`s

1. **CH2-LAYOUT-01's exact component and viewport** — is "center-timeline-container" the Chapter-1 desktop timeline being requested at a *different* viewport (which would contradict the archived `responsive-storytelling-motion` spec's explicit intent that intermediate layouts stay simplified — that would make it a new feature request, not a regression), or is it actually the Chapter-2 Gantt chart mislabeled in the note? This changes which bucket it belongs in.
2. **CH3-STICKY-CENTER-01** — is the box currently mis-positioned (bug) or just not the reader's preferred position (enhancement)? The original triage flagged this exact ambiguity.
3. Should **SCROLL-IND-ALIGN-01**'s `735px` boundary reuse one of the project's existing breakpoints (640/768/1024) instead of introducing a fifth one?

## Next step

Once the above ambiguities are resolved (or explicitly accepted as-is), run `/spectra-propose` for `fix-responsive-story-acceptance-gaps` (Bucket A) first, since it's regression work against a baseline that already exists in `openspec/specs/`.
