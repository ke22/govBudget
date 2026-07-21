## Context

`115MoneyDemoB-main/index-v2.html` is a single-file scrollytelling report. The already-archived `stabilize-responsive-story-layout` change verified a seven-viewport matrix and forward/reverse scroll behavior and synced its specs (`responsive-editorial-hero`, `chart-viewport-clearance`, `chapter-visual-exit`, among others) into `openspec/specs/`. After that archive, an ad-hoc (non-Spectra-tracked) editing session repositioned the hero stamp, and a post-archive triage (`115MoneyDemoB-main/ISSUE-TRIAGE-v2.md`) found four defects that violate requirements those specs already state. This change closes those four gaps without introducing new visual design (that's tracked separately in `refine-story-scroll-choreography` and `polish-story-page-visual-hierarchy`).

All four issues live in the same file's CSS/JS and share one theme: two pieces of layout/timing logic were each authored independently (correctly in isolation) but nothing ties them together, so a later independent edit to either side silently breaks the pair.

## Goals / Non-Goals

**Goals:**

- Make the hero stamp's position depend on the title's actual rendered geometry (or a margin sized to the stamp's worst case) instead of two independent absolute-position rules.
- Make the Chapter-2 Gantt's own frame resize consistently at the intermediate breakpoint, matching the pattern `LEARNINGS.md` #3 documents.
- Sequence the Chapter-2 step-9 transition so the last history image finishes before the last story card enters.
- Extend the existing Chapter-2→3 exit guard to cover the reverse-scroll case and the text story-card element, not only the fixed image backdrop.

**Non-Goals:**

- No new motion/choreography design (arrow terminus, staged gray-chart reveal, etc.) — see `refine-story-scroll-choreography`.
- No change to `#ch3-sticky-box-wrapper` centering — confirmed deliberate, not a bug.
- No change to `index.html`, `database.html`, `database-v2.html`, or desktop (≥1025px) layout for items 1-2.

## Decisions

### Hero stamp: compute position from title geometry, not a second independent rule

Two options: (a) measure `.hero-title`'s rendered `getBoundingClientRect()` in JS on load/resize and position the stamp wrapper relative to it; (b) keep both elements CSS-only but reserve a static clearance margin on `.hero-title` sized to the stamp's worst-case footprint (its rendered width/height at each breakpoint) so the two can never geometrically overlap regardless of title line count.

**Chosen: (b), CSS-only reserved margin**, because the title's own font-size and line count are already breakpoint-driven (`clamp()`-based per the archived `editorial-type-and-color-hierarchy` spec) and bounded, so a worst-case margin can be computed once per breakpoint without a resize listener. Reserve a `padding-top`/`margin-top` on `.hero-headline-panel`'s content (or increase the panel's top padding) equal to the stamp's rendered height minus its `top` offset, at each of the ≤1024px breakpoints where the stamp uses a different `top`/`right`/scale. This keeps the fix declarative and avoids adding a JS measurement/resize-observer dependency for a purely presentational concern.

**Alternative considered:** JS-measured collision detection (option a). Rejected as over-engineered for a two-element, breakpoint-bounded case — a reserved-margin approach is fully sufficient and has zero runtime cost.

### Gantt frame: extend the existing intermediate-breakpoint block, not a new one

The `@media (min-width: 641px) and (max-width: 1024px)` block already exists (index-v2.html:3228) and already overrides `.gantt-card-rebuilt`/`#ch3-sticky-box-wrapper`. Add the Chapter-2 Gantt frame's `left`/`right`/`bottom` overrides (on `.gantt-rows-container-rebuilt`, `.gantt-grid-rebuilt`, `.gantt-x-axis-rebuilt`, `.gantt-red-deadline-stage`) to that same block, sized proportionally to the intermediate width, rather than opening a second, separate `@media` block — keeping all of one breakpoint's overrides co-located, matching this file's existing convention.

### Card/image sequencing: `transitionend`-driven, not a fixed timer

Two options: (a) add a fixed `setTimeout` delay (e.g. 400ms) between the image reaching step-9 and the card being allowed to animate in; (b) listen for the third history image's own `transitionend` (it already has `transition: opacity 0.5s ease` per index-v2.html:1222) and only then add the class/style that starts the card's entrance.

**Chosen: (b), event-driven.** A fixed timer would need to be kept in sync with the image's actual transition duration by hand and would drift if that duration is tuned later; listening for `transitionend` ties the two intrinsically together, which is the same principle behind fixing the other three items (make dependent things listen to the thing they depend on, instead of coincidentally-matching independent values).

### Exit guard extension: reuse `updateHistoryExit()`'s computed progress, applied to a second target

`updateHistoryExit()` already computes an exit `progress` value (0-1) from the step-9 card's own position and Chapter 3's position. Apply that same computed `progress` (and the `chapter3Top <= viewportHeight` hard-exit check) as a second `opacity`/`pointer-events` target on the step-9 story-card element itself, rather than writing an independent second calculation — this guarantees the two targets can never fall out of sync with each other, addressing the root cause (two independently-computed things) rather than just adding more independent logic for the text card.

## Implementation Contract

- **Behavior**: (1) at ≤1024px, `.hero-stamp-wrap` and `.hero-title`'s rendered boxes never intersect for the current copy at any of 320×568/390×844/430×932/768×1024/820×1180/1024×768; (2) at 641-1024px, the Chapter-2 Gantt's bars and axis stay inside `.gantt-backdrop-box-rebuilt`; (3) at desktop width, the third history image visibly finishes its fade-in before the step-9 card's entrance transition starts; (4) scrolling forward and backward through the Chapter 2 → Chapter 3 boundary never shows the step-9 card or the image backdrop overlapping Chapter 3 content.
- **Interface/data shape**: no new JS globals, IPC, or file formats — this is CSS layout plus one additional `transitionend` listener and one additional style/class target inside the existing `updateChapter2Stage()`/`updateHistoryExit()` functions in index-v2.html.
- **Failure modes**: if the third history image's `transitionend` never fires (e.g., a browser that drops the event under some interruption), the step-9 card MUST still become reachable/interactive — do not leave it permanently blocked; a safety fallback (e.g., also advancing on the existing scroll-step change, capped to whichever comes first) is acceptable so this sequencing behaves as a visual sequencing preference, not a functional gate. Reduced-motion mode SHALL skip the sequencing delay entirely and show both immediately, consistent with `responsive-storytelling-motion`'s existing reduced-motion requirement.
- **Acceptance criteria**: the five Success Criteria items already listed in `proposal.md`, verified at the listed viewports via DOM `getBoundingClientRect()` overlap checks (items 1, 2, 4) and a scroll-through capture (item 3).
- **Scope boundaries**: in scope — `115MoneyDemoB-main/index-v2.html` CSS and the `updateChapter2Stage()`/`updateHistoryExit()` JS functions only. Out of scope — any other file, any new visual design, any change to breakpoint values themselves, any change to `#ch3-sticky-box-wrapper` positioning.

## Risks / Trade-offs

- [Reserved-margin approach for the hero stamp is a worst-case estimate, not a live measurement] → Mitigation: verify against the *current* title/subtitle copy at all six listed viewports; if either string changes length substantially later, re-verify (documented in the spec's own scenario).
- [`transitionend`-driven sequencing can silently never fire in edge cases (e.g., `display:none` toggles that skip transitions)] → Mitigation: the failure-mode fallback above caps the wait so the card is never permanently stuck.
- [Extending `updateHistoryExit()`'s target list touches a function already flagged in `LEARNINGS.md` as handling forward-jump edge cases carefully] → Mitigation: reuse its already-computed `progress` value rather than adding a second computation, minimizing the surface for a new desync bug.

## Open Questions

- None outstanding — all four items have a concrete chosen approach above.
