# Issue Triage — `index-v2.html` new backlog (2026-07-21)

Source: raw observation notes pasted into chat after the `stabilize-responsive-story-layout` ad-hoc follow-up round (hero artwork swap, stamp reposition, desktop timeline reveal). The notes were pasted three times with duplicates and some garbled/incomplete HTML. This table deduplicates them into one list, following the four-bucket framework already recorded in `HANDOFF-v2.md`.

**Read before acting:** several rows below are marked `⚠ unconfirmed` — I inferred viewport/component/current-behavior from the note's wording and its grouping in the pasted text, not by reading the live DOM/CSS. Verify those against the actual code or a live screenshot before writing them into a `proposal.md`. Rows without that marker are close to verbatim from the notes.

**Update 2026-07-21, post-code-check:** all three open cross-cutting questions from the original version of this file are now resolved by reading `index-v2.html` directly (see "Open cross-cutting questions" section at the bottom, kept for the record). This revision reflects those findings — CH2-LAYOUT-01 was split into two separate items, CH3-STICKY-CENTER-01 is now confirmed Bucket B not ambiguous, and SCROLL-IND-ALIGN-01's breakpoint is flagged as non-standard.

## Bucket A — Acceptance gaps (regressions against the archived `stabilize-responsive-story-layout` baseline)

Target change: `fix-responsive-story-acceptance-gaps`

| ID | Viewport | Component | Current | Expected | Severity |
|---|---|---|---|---|---|
| HERO-STAMP-01 | ≤1024 (compact+intermediate) | `.hero-stamp-wrap` vs. hero title | Risk of the stamp overlapping the title (per note "don't cover title") | Stamp SHALL remain geometrically disjoint from title/subtitle/dek at all supported widths, per the already-archived `responsive-editorial-hero` spec's no-overlap requirement | P1 |
| CH2-GANTT-CROWDING-01 (code-confirmed) | 641–1024 (intermediate) | `#gantt-stage-rebuilt` (Chapter-2 Gantt: `.gantt-x-axis-rebuilt`, `.gantt-rows-container-rebuilt`) | The `@media (min-width: 641px) and (max-width: 1024px)` block (index-v2.html:3228) only adjusts `.gantt-card-rebuilt` min-height and `#ch3-sticky-box-wrapper` — it does **not** override the Gantt's own absolutely-positioned frame (`left/right/bottom`, per `LEARNINGS.md` #3). At this width the frame is very likely still the desktop px-frame, which `LEARNINGS.md` already documents as the exact mechanism that crowds bars and drifts the axis when unresized. Confirm with a live 768–1024px screenshot. | Bars contained, Y/X axis fully inside the chart boundary, no crowding — required by the already-archived `chart-viewport-clearance` spec's "Chart panels fit remaining viewport height" | P1 |
| CH2-CARD-TIMING-01 (code-confirmed) | Desktop (≥1025) — step is purely `scrollPercent`-based, mobile uses a different (position-based) trigger, not checked here | Chapter-2 step-9 story card vs. third `.history-img-frame` (the 003.jpg large photo) | `updateChapter2Stage()` (index-v2.html:4657-4666) adds `rebuilt-step-9` to the chapter at `scrollPercent >= 84`. That single class simultaneously (a) activates the step-9 story card and (b) makes `.rebuilt-step-9 .history-img-frame:nth-child(3)` visible (index-v2.html:1307-1310) — both driven by the exact same class toggle, so they appear at the same instant. No sequencing exists between them. | Last story card SHALL wait for the last history image to finish appearing before it starts scrolling in — this requires adding a real delay/sequencing mechanism where none exists today, not just a timing tweak | P2 |
| CH2-CH3-OVERLAP-01 (code-confirmed — guard exists, edge cases unverified) | Not stated | `#backdrop-images-rebuilt` (Ch2 history-photo backdrop) vs. Chapter 3 entering | `updateHistoryExit()` (index-v2.html:4530-4554) already fades this backdrop to `opacity:0`/`pointer-events:none` as the step-9 card's top crosses 55vh→35vh, and **forces it fully hidden** the instant Chapter 3's top reaches the viewport (line 4549) specifically to cover large scroll jumps. On paper this guard should prevent the overlap described in the note. | If overlap still occurs in practice, it's likely an edge case this guard doesn't cover (e.g. reverse-scroll timing, or the *text* story-card element in normal flow rather than the fixed image backdrop this logic targets) — not a missing guard. Needs a live repro to identify which case, since the intended mechanism is already there. | P2 (downgraded from P1 — a guard exists; treat as "verify/harden," not "build from scratch") |

## Bucket B — New scroll choreography (motion/sequencing, not required by the archived baseline)

Target change: `refine-story-scroll-choreography`. All items below are stated for `≥1025` (desktop) unless noted.

| ID | Viewport | Component | Current | Expected | Severity |
|---|---|---|---|---|---|
| TIMELINE-LEAD-01 | ≥1025 | `#center-main-line-fill` vs. `.timeline-row .item-node` | Line fill presumably reaches a node exactly as the node's reveal starts | Line SHALL visually appear/extend 40px *before* the item-node's start point | P2 |
| TIMELINE-TRIGGER-01 | ≥1025 | `.timeline-row .item-card` | Card trigger point tied to exact line/node alignment (same mechanism as above) | Card SHALL be triggered when the line passes 40px *before* reaching the card, not when it's exactly at the card | P2 |
| TIMELINE-TERMINAL-01 | ≥1025 | `#center-main-line-fill` end cap | Line end renders as a plain line throughout | Line's leading end SHALL render as an arrow while progressing; at the very last point, the arrow SHALL revert to a plain line and a small pulsing question mark SHALL appear at the terminus | P2 |
| CH2-STAGED-REVEAL-01 | Grouped with the ≥1025 items in the notes ⚠ unconfirmed whether desktop-only | `.chapter-section-rebuilt.rebuilt-step-2` chart | Chart bars appear directly per current step logic | On Chapter-2 card 1 trigger: show an empty gray placeholder chart. On card 2 trigger: highlight the X and Y axes | P2 |
| CH1-TIMELINE-INTERMEDIATE-01 (code-confirmed, new) | 641–1024 (intermediate) | `.center-timeline-container` (Chapter 1) | Deliberately normal-flow/no-reveal below 1025px — the alternating desktop reveal is explicitly gated to `@media (min-width: 1025px)` with a code comment stating narrow layouts intentionally "keep their normal-flow cards so the mobile reading order stays uninterrupted" (index-v2.html:657-659), matching the archived `responsive-storytelling-motion` spec's stated intent for intermediate layouts | Extend the desktop alternating-timeline-reveal concept to intermediate width too | This is a genuine new feature request, not a bug — implementing it means **amending** `responsive-storytelling-motion`'s existing "intermediate storytelling simplifies motion" requirement, not just adding a new spec on top. Flag explicitly in the choreography proposal rather than treating it as incidental. | P2 |
| CH3-STICKY-CENTER-01 (code-confirmed) | Not stated | `#ch3-sticky-box-wrapper` (`.gantt-sticky-box-rebuilt`) | `position: sticky; top: var(--chart-stage-top)` (index-v2.html:1473) — deliberately top-anchored, directly implementing the archived `chart-viewport-clearance` spec's header-clearance requirement. Confirmed **not a bug**. | Box centered vertically in the viewport instead | This is a design-preference change that conflicts with the current spec's top-clearance requirement — implementing it means amending `chart-viewport-clearance`, not just adding new behavior | P3 |
| CH3-GREY-BAR-ANIM-01 | Not stated | `#ch3-bar-total-grey` | No animation beyond whatever the existing bar-growth step transition does | Unclear — note reads "I want [this element]. Also have animation with th[is]" and cuts off mid-sentence. Best guess (from the earlier separate triage pass): a reveal animation on the grey total-bar layer specifically. **Not confident enough to spec — ask the user to finish the sentence.** | Needs spec |
| CH2-CLOSING-PARA-01 | Not stated | Chapter 2 closing paragraph | Unclear current trigger point | Closing paragraph SHALL only appear after the last story card *and* the chart have both scrolled out of the viewport | P2 |

## Bucket C — Visual polish (not blocking comprehension/interaction)

Target change: `polish-story-page-visual-hierarchy`

| ID | Viewport | Component | Current | Expected | Severity |
|---|---|---|---|---|---|
| SCROLL-IND-CONTRAST-01 | ≥1025 | `.scroll-indicator` | Contrast described as insufficient (no specific numbers given) | Increase contrast against the hero background | P3 |
| SCROLL-IND-ALIGN-01 | <735 (code-confirmed non-standard: the file's actual breakpoints are 640/968/1024/1025/1340 — 735 matches none of them) | `.scroll-indicator` | Not centered | Center-aligned — recommend snapping this to the existing 640px compact boundary unless there's a specific reason to add a fifth breakpoint | P3 |
| HERO-STAMP-02 | Not stated, likely all widths | `.hero-stamp` | Current size | Larger, and center-aligned — **distinct from HERO-STAMP-01 above**: this is a size/alignment preference, not the overlap bug | P3 |
| FOOTER-SEPARATION-01 | Not stated | Footer vs. body | Footer blends into body background | Visually distinguish the footer from the body (border, background shift, or spacing) | P3 |

## Bucket D — Needs specification before any change is written

Not ready for a `proposal.md`. Ask the user to finish/clarify these before acting:

| Note as pasted | Why it's not actionable yet |
|---|---|
| "I want `#ch3-bar-total-grey`. Also have animation with th…" | Sentence cuts off mid-word ("th[is]?") — what animation, triggered by what, is unstated. Tracked provisionally as CH2-GREY-BAR-ANIM-01 above but flagged unconfident. |
| "Cover chap 3" | No surrounding context anywhere in the notes. Could mean "add a cover/transition before Chapter 3," "something is incorrectly covering Chapter 3," or is an unrelated leftover fragment. Cannot guess responsibly. |

## Open cross-cutting questions — RESOLVED 2026-07-21 by reading `index-v2.html` directly

Kept for the record; the table above already reflects these findings.

1. ~~CH2-LAYOUT-01's exact component and viewport~~ — **Resolved: two separate items.** `.center-timeline-container` (index-v2.html:3548) is Chapter 1's timeline — no bars, no axis, so it can't be the source of "bars crowd / Y-axis overflow." That complaint matches the Chapter-2 Gantt (`#gantt-stage-rebuilt`) instead, whose intermediate-width media query doesn't touch its own frame (see CH2-GANTT-CROWDING-01). Separately, "follow desktop concept" for `.center-timeline-container` is a real, distinct request to extend Chapter 1's desktop-only reveal to intermediate width (see CH1-TIMELINE-INTERMEDIATE-01) — currently gated off on purpose per a code comment and the archived spec.
2. ~~CH3-STICKY-CENTER-01~~ — **Resolved: not a bug.** Confirmed top-anchored by design (`top: var(--chart-stage-top)`, index-v2.html:1473), implementing the archived `chart-viewport-clearance` spec. Centering it is a design change that would need to amend that spec.
3. ~~SCROLL-IND-ALIGN-01's 735px boundary~~ — **Resolved: non-standard.** The file's actual breakpoints are 640/968/1024/1025/1340; 735 isn't one of them. Recommend snapping to 640 unless there's a specific reason not to.

## Live-scroll verification — blocked, proceeded on code evidence only

Attempted to visually verify CH2-CARD-TIMING-01 and CH2-CH3-OVERLAP-01 via a live scroll-through in the browser. The dev server (`python3 -m http.server 8001`) responds `200` to `curl` from the terminal, but the Chrome extension (`list_connected_browsers` reports it as local/macOS) returned "site can't be reached" across 2 tabs, `localhost` and `127.0.0.1`, and 2 different ports — a genuine environment issue, not a page bug. Per explicit instruction, both items above were finalized from source-code reading alone (exact line numbers cited in each row) rather than a screenshot. Confidence is high for CH2-CARD-TIMING-01 (the class-toggle simultaneity is unambiguous in the code); CH2-CH3-OVERLAP-01 is necessarily softer since a guard already exists and the failure mode (if any) would only show up live — flagged as "verify/harden" rather than "build from scratch."

## Next step

Ready to write `proposal.md`s — all Bucket-A items now have code-level evidence (CH2-GANTT-CROWDING-01, HERO-STAMP-01, CH2-CARD-TIMING-01, CH2-CH3-OVERLAP-01). Recommend running `/spectra-propose` for `fix-responsive-story-acceptance-gaps` (Bucket A) first, since it's regression work against a baseline that already exists in `openspec/specs/`. Note CH1-TIMELINE-INTERMEDIATE-01 and CH3-STICKY-CENTER-01 (Bucket B) both require amending an existing archived spec, not just adding new behavior — call that out explicitly in `refine-story-scroll-choreography`'s proposal. When a working browser session is available, a live pass over CH2-CH3-OVERLAP-01's reverse-scroll case specifically would still be worth doing before considering that item closed.
