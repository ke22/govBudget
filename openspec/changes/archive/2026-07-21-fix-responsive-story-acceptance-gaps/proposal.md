## Problem

Four defects on `115MoneyDemoB-main/index-v2.html` violate requirements that the already-archived `stabilize-responsive-story-layout` change (and its synced specs in `openspec/specs/`) claims are satisfied. Found during a post-archive triage of live-device/desktop observation notes (`115MoneyDemoB-main/ISSUE-TRIAGE-v2.md`, Bucket A):

1. **Hero stamp risks covering the hero title at compact/intermediate widths (≤1024px).** `responsive-editorial-hero`'s "Compact hero content remains readable" and "Intermediate hero content remains readable" scenarios require the title, subtitle, overdue stamp, dek, and scroll affordance to be visible "without overlap, clipping, or horizontal overflow" at 390×844, 430×932, 768×1024, 820×1180, and 1024×768.
2. **Chapter-2 Gantt chart bars crowd together and the axis runs outside the chart boundary at intermediate width (641–1024px).** `chart-viewport-clearance`'s "Chart panels fit remaining viewport height" requirement is violated.
3. **Chapter-2's last story card (step 9) and the last history photo appear at the exact same instant**, with no sequencing between them, even though the underlying report content implies the photo should finish appearing first.
4. **Chapter-2's history-photo backdrop and Chapter-3 can still end up visually overlapping in edge cases** (reverse scroll, or the text story-card in normal flow rather than the fixed image backdrop), even though `chapter-visual-exit`'s "Chapter 2 visual cannot cover Chapter 3" requirement has a forward-scroll guard in place.

## Root Cause

1. **Hero stamp**: `.hero-stamp-wrap` at ≤1024px (index-v2.html:3122-3129) is deliberately positioned to straddle the top edge of `.hero-headline-panel` (`position: absolute; top: -26px; right: clamp(16px, 5vw, 42px)`, per the code comment "印章疊釘在合併紙卡上緣，一半在卡片外、一半壓進卡片內" — "the stamp straddles the card's top edge, half outside/half inside"). This positioning is independent of `.hero-title`'s actual rendered text bounds — there is no collision-avoidance logic (no reserved margin, no JS measurement) tying the two together, only two independently-positioned CSS rules. `HANDOFF-v2.md` records this exact stamp repositioning as an **ad-hoc edit made after** `stabilize-responsive-story-layout`'s verification pass (which checked collision at 390×844/430×932/768×1024/820×1180/1024×768) — so the current stamp position has never actually been re-verified against the spec it must satisfy.
2. **Chapter-2 Gantt crowding**: the Gantt chart is absolutely positioned with a shared pixel frame (`left`/`right`/`bottom` on `.gantt-rows-container-rebuilt`, `.gantt-grid-rebuilt`, `.gantt-x-axis-rebuilt`, `.gantt-red-deadline-stage`; see `115MoneyDemoB-main/LEARNINGS.md` #3). The `@media (min-width: 641px) and (max-width: 1024px)` block (index-v2.html:3228-3246) only adjusts `.gantt-card-rebuilt` min-height and `#ch3-sticky-box-wrapper`'s transform — it does not override the Gantt's own frame. At this width the frame is still sized for desktop, which is the exact mechanism `LEARNINGS.md` documents as crowding bars and drifting the axis when the frame isn't resized identically on all its elements.
3. **Card/image simultaneity**: `updateChapter2Stage()` (index-v2.html:4657-4666) reaches step 9 purely from `scrollPercent >= 84` (desktop) and, in one block, both activates the step-9 story card and lets `.rebuilt-step-9 .history-img-frame:nth-child(3)` become visible (index-v2.html:1307-1310) via the same `rebuilt-step-9` class toggle. Both effects are gated by the identical class on the identical scroll event with no intermediate stage.
4. **Card/chart overlap edge case**: `updateHistoryExit()` (index-v2.html:4530-4554) already fades `#backdrop-images-rebuilt` to `opacity: 0` / `pointer-events: none` as the step-9 card's top crosses 55vh→35vh, and forces it fully hidden the instant Chapter 3's top reaches the viewport — but this guard only tracks `finalStoryCard.getBoundingClientRect().top` and `chapter3.getBoundingClientRect().top`, both sampled per-`rAF`-frame in the forward direction; reverse-scroll re-entry and the independently-flowing text story-card element (as opposed to the fixed image backdrop this function targets) are not covered by the same exit calculation.

## Proposed Solution

1. Compute the hero stamp's position from the rendered geometry of `.hero-title`/`.hero-headline-panel` (or reserve a fixed clearance margin sized to the stamp's worst-case footprint) at ≤1024px, so the two can never occupy the same pixels regardless of title line count or viewport width — instead of two independently-authored absolute-position rules. Verify collision-free at all five widths named in `responsive-editorial-hero`'s scenarios (390×844, 430×932, 768×1024, 820×1180, 1024×768) plus 320×568 as a worst-case narrow phone.
2. Add a `@media (min-width: 641px) and (max-width: 1024px)` override for the Gantt's own frame (mirroring the pattern already used for `.gantt-card-rebuilt`/`#ch3-sticky-box-wrapper` in that same block) that resizes `left`/`right`/`bottom` on all frame elements identically, per `LEARNINGS.md` #3's guidance, so bars stay contained and the axis stays inside the chart boundary. Verify at 768×1024 and 1024×768.
3. Introduce an explicit intermediate stage between step 8 and step 9 (or a short delay keyed to the third history image's own transition) so the last history image visibly finishes appearing before the step-9 story card begins its entrance, instead of both being driven by one simultaneous class toggle. Verify the image completes its own fade-in before the card's entrance animation starts, at desktop width.
4. Extend `updateHistoryExit()` (or add a parallel check) so the exit/hide guard also accounts for: (a) the reverse-scroll case — confirm the backdrop correctly re-appears/re-hides symmetrically when scrolling back up through the same range without stale state, and (b) the step-9 text story-card element specifically, not only the fixed image backdrop, so neither can be caught visually overlapping Chapter 3 content in any scroll direction.

## Non-Goals (optional)

- No changes to Chapter 1 (`.center-timeline-container`) or Chapter 3's own bar/legend behavior — those are separate items tracked in `refine-story-scroll-choreography` (see `ISSUE-TRIAGE-v2.md` Bucket B).
- No change to `#ch3-sticky-box-wrapper`'s vertical centering — confirmed by code reading to be deliberate per `chart-viewport-clearance`, not a bug; tracked separately in Bucket B as a spec-amendment candidate.
- No new visual/motion design (arrow terminus, pulsing question mark, staged gray-chart reveal, footer separation, scroll-indicator contrast) — those are Bucket B/C items in separate changes.
- No changes to `index.html`, `database.html`, or `database-v2.html`.
- Desktop (≥1025px) layout for items 1 and 2 is unaffected — both are scoped to ≤1024px only.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `responsive-editorial-hero`: add a requirement that the overdue stamp's position is computed relative to the rendered title's bounds (or a reserved worst-case margin) at compact/intermediate widths, instead of two independently-authored absolute-position rules — closes the gap that let an ad-hoc edit silently drift out of compliance with this capability's existing no-overlap scenarios.
- `chart-viewport-clearance`: add a requirement that the Chapter-2 Gantt's own absolutely-positioned frame (`left`/`right`/`bottom` on all frame elements) is resized consistently at every breakpoint that resizes the chart stage, not just at compact width — closes the gap that let the intermediate (641-1024px) breakpoint crowd bars and drift the axis.
- `chapter-visual-exit`: add a requirement that the final history image completes its own appearance before the final story card's entrance begins, and extend the existing "Exit state is reversible and motion-aware" requirement's scenarios to explicitly cover the step-9 text story-card element (not only the fixed image backdrop `updateHistoryExit()` already targets).

## Success Criteria

1. At every viewport in `responsive-editorial-hero`'s existing scenarios (390×844, 430×932, 768×1024, 820×1180, 1024×768) plus 320×568, the rendered hero stamp and hero title bounding boxes do not intersect, for the current title/subtitle copy.
2. At 768×1024 and 1024×768, the Chapter-2 Gantt's bars remain fully inside `.gantt-backdrop-box-rebuilt`'s bounds and no axis tick or label renders outside the chart panel.
3. At desktop width, scrolling forward through Chapter 2 step 9 shows the third history image reach full opacity before the step-9 story card's entrance transition begins (not simultaneously).
4. Scrolling forward and then back through the Chapter 2 → Chapter 3 boundary at 390×844, 768×1024, and 1366×768 shows no frame where the Chapter-2 history backdrop or the step-9 story card visually overlaps Chapter 3 heading/chart content, in either scroll direction.
5. No regression: the seven-viewport matrix and forward/reverse scroll checks already used for `stabilize-responsive-story-layout` (see its archived `tasks.md`, section 5) still pass.

## Impact

- Affected code:
  - Modified: 115MoneyDemoB-main/index-v2.html
  - New: (none)
  - Removed: (none)
