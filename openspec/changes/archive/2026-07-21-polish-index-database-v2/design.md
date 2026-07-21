## Context

`115MoneyDemoB-main/index.html` (報導頁) and `115MoneyDemoB-main/database.html` (資料庫頁) are the two live pages of the CNA FY115 budget-review site. This change bundles 19 distinct fixes/edits found during `/spectra-discuss` against a consolidated user feedback list, spanning header nav, hero layout, Chapter 2/3 scrollytelling timing and motion, copy edits, and database-page filter/list behavior. All work lands on new duplicate files (`index-v2.html`, `database-v2.html`) so the live pages are unaffected until the user reviews and promotes them separately.

Most items are simple, independent CSS/text edits (badge removal, copy replacement, footer reorder, step-label removal, amount removal) that need no design decision beyond "make the v2 copies first." This document covers only the handful of items with real technical decisions: the three new capabilities from the proposal, plus the two confirmed root-cause bugs whose fix approach isn't a one-line change.

## Goals / Non-Goals

**Goals:**

- `index-v2.html` and `database-v2.html` are created as exact byte-for-byte starting copies of the current live files before any edit is applied.
- Every fix in the proposal's "Proposed Solution" list is applied to the `-v2` files only.
- The three new capabilities (keyword tags, desktop pill-row scroll, mobile card slide motion) are implemented as durable, testable behavior, not one-off tweaks.
- The two confirmed-root-cause bugs (missing `.rebuilt-step-1` rule, `.val-num` mobile overflow) are fixed at their actual root cause, not papered over with a wrapper fix elsewhere.

**Non-Goals:**

- Promoting `-v2` files to production — a separate, later, user-driven step.
- Redesigning the Google Sheets `gviz` data-fetch pipeline in `database.html` — the keyword-tag capability reads the existing `關鍵字` field from the already-fetched row data.
- Fixing any other pre-existing dead code (e.g. `.history-img-frame-single`) not named in the proposal.
- Any accessibility/perf work already covered by the separate, already-completed `fe-polish-2026-07-16` change.

## Decisions

### Duplicate-first workflow for index-v2.html and database-v2.html

Before any other task runs, copy `115MoneyDemoB-main/index.html` to `115MoneyDemoB-main/index-v2.html` and `115MoneyDemoB-main/database.html` to `115MoneyDemoB-main/database-v2.html`, unmodified. Every subsequent task in this change edits only the `-v2` files. This is a hard ordering constraint: no other task may start before both copies exist, because every task's file target is the `-v2` path.

Rejected alternative: editing `index.html`/`database.html` directly and relying on git to let the user "revert if they don't like it." Rejected because the user explicitly asked for the live pages to stay untouched during review, and a mid-review revert on a live public page is a worse failure mode than a duplicate file sitting unused.

### Chapter-2 card→chart sync uses a tighter IntersectionObserver rootMargin

The existing `IntersectionObserver` (in `index-v2.html`, ported from `index.html`'s current `rootMargin: '-10% 0px -20% 0px', threshold: 0.05`) drives `.gantt-card-rebuilt.is-active`, which Chapter-2's bar-fill logic reads to decide when to grow the Gantt bars. A `-20%` bottom margin means a card must scroll nearly a fifth of the viewport height past what a reader would call "in view" before `.is-active` flips, producing the reported lag between card 2's text appearing and its matching chart step firing.

Decision: narrow the bottom margin to `-8%` (from `-20%`) and keep the top margin at `-10%`, i.e. `rootMargin: '-10% 0px -8% 0px'`. This keeps the existing "card must be meaningfully on-screen, not just barely peeking in" guard (the reason the wide margins were added in the first place, per the inline comment at the call site) while cutting the perceptible lag roughly in half. Desktop and mobile share this same observer and margin — no separate mobile-only value, since the lag was reported on both.

Rejected alternative: switching chart-step triggering to scroll-percent thresholds instead of `.is-active`. Rejected because a prior session already moved this signal from scroll-percent to `.is-active` specifically to fix a different, worse timing bug (bars growing before their card was visible at all) — reverting that would reintroduce the older bug to fix this smaller one.

### Mobile Chapter-2/3 cards get a translate-based slide instead of an opacity fade

Currently (ported into `index-v2.html`), `#chapter-2-rebuilt .gantt-card-rebuilt` on mobile is pinned with `align-items: center; justify-content: center` inside a `min-height: 100vh` block, and the active card is selected purely via `opacity: 0/1; visibility: hidden/visible` toggles keyed off `#chapter-2-rebuilt.rebuilt-step-N`. This makes every card appear to fade in and out at the vertical center of the screen, rather than traveling with scroll the way desktop's cards do (desktop cards sit in normal document flow and are pushed aside via `margin-left: 40%`, so they visually travel bottom-to-top as the user scrolls).

Decision: keep the existing step-class-driven show/hide mechanism (each step's card is still the one and only visible card at a time — no change to which card is "active" or when), but replace the opacity/visibility toggle with a `transform: translateY(...)` + `opacity` transition: the outgoing card translates and fades upward off-screen (`translateY(-40px)` combined with `opacity: 0`), the incoming card translates in from below (`translateY(40px)` to `translateY(0)` combined with `opacity: 0` to `opacity: 1`), using a CSS `transition` on `transform, opacity` (not `visibility`, since `visibility` cannot be transitioned and is not needed once `opacity: 0` + `pointer-events: none` on inactive cards already prevents interaction/accessibility exposure). Apply the exact same transition to the step-9 card so its exit (paired with the step-9 photo change) reads as a slide-up-and-off rather than an instant disappearance.

Rejected alternative: switching mobile to the same real scroll-flow layout as desktop (removing the pinned/fixed stage entirely). Rejected because the pinned band + step-toggle mechanism is exactly what an earlier session's mobile scrollytelling fix (documented in `115MoneyDemoB-main/HANDOFF.md`) put in place on purpose, to guarantee the chart and card are never both visible-and-overlapping — replacing it would reopen that already-solved problem for the sake of a motion-only complaint.

### Desktop pill-row scroll uses pointer-based drag-to-scroll

`.pill-row` (in `database-v2.html`) keeps `overflow-x: auto` and the existing hidden-scrollbar + vignette-shadow styling (both are fine as an overflow *indicator*; the gap is the lack of an interaction path). Add a `pointerdown`/`pointermove`/`pointerup` drag handler scoped to `.pill-row` elements: on `pointerdown`, record the starting `clientX` and the row's current `scrollLeft`; on `pointermove` (while the pointer is down), set `scrollLeft` to `startScrollLeft - (clientX - startX)`; on `pointerup`/`pointerleave`, stop tracking. This is additive to the existing scroll-fade JS (`updatePillRowFades`), not a replacement — dragging still triggers the existing `scroll` listener that toggles `.fade-left`/`.fade-right`.

Rejected alternative: a visible native scrollbar (removing `scrollbar-width: none`). Rejected because a thin horizontal scrollbar directly under a compact pill row reads as visual clutter and doesn't match the newsprint aesetic already established for the page; drag-to-scroll solves the actual access problem (desktop mouse users can reach hidden pills) without changing the visual design.

### Keyword tags render from the existing `關鍵字` field, chip-styled like `.pill-btn`

Each project row already carries a `關鍵字` value (Chinese-comma `、`-separated, e.g. `國家行政、人事行政、主計、資訊、警政`) fetched live via the existing `gviz` JSON call in `database-v2.html`, and already used by `matchKeywordCheck`. Add a small tag-chip renderer to the `.project-block` card template: split the row's `關鍵字` value on `、`, trim each piece, and render each as a `<span class="pb-tag">` chip (new class, styled as a smaller/lighter variant of `.pill-btn` — same pill shape and border-hairline language, non-interactive, no click handler) placed under the existing title/department line. Rows with an empty `關鍵字` value render no chips (not a placeholder chip).

Rejected alternative: reusing `.pill-btn` directly (same class) on cards. Rejected because `.pill-btn` carries interactive/selected-state styling (hover, active fill) meant for the filter controls; reusing it verbatim on a purely-informational per-card tag would make static tags look clickable/interactive when they are not.

### `.val-num` mobile overflow fix: allow wrapping instead of forcing single-line width past viewport

Every `.pyramid-align-row .bar-group.right-bar-box .val-num` in Chapter 4 (`index-v2.html`) currently sets `white-space: nowrap`, which lets long values push their container past the viewport edge on mobile (confirmed: one instance overflowed by exactly 31px, matching the entire page's `document.body.scrollWidth` excess measured live). Remove `white-space: nowrap` from `.val-num` inside the existing mobile media query (`@media (max-width: 968px)`) so long values can wrap onto a second line within their existing container width, instead of forcing single-line overflow. Desktop's `.val-num` keeps `white-space: nowrap` unchanged, since the desktop layout has enough horizontal room and the bug was only observed on mobile widths.

Rejected alternative: shrinking `.val-num` font-size on mobile until it always fits on one line. Rejected because the exact overflow amount depends on the specific value's digit count, which varies per project/comparison — a fixed font-size shrink would need constant re-tuning as data changes, while allowing wrap is correct for any value length.

## Implementation Contract

**Behavior**:
- `index-v2.html` and `database-v2.html` exist as full copies of the current live pages, then diverge only per the fixes listed in the proposal; `index.html`/`database.html` remain byte-identical to their pre-change state.
- On `database-v2.html`, every rendered `.project-block` card shows one small tag chip per `、`-separated value in that project's `關鍵字` field (zero chips if the field is empty), sourced from the live spreadsheet fetch — no hardcoded tag list anywhere in the code.
- On `database-v2.html` at desktop widths, a user can click-and-drag horizontally inside `#theme-pills` or `#ministry-pills` to reveal pills that are otherwise clipped past the container edge; releasing the drag stops the scroll at the dragged position.
- On `index-v2.html` at mobile widths (`max-width: 968px`), scrolling through Chapter 2 or Chapter 3 shows the active story card sliding in from below the viewport and the outgoing card sliding out toward the top, rather than both fading in place at screen center; this applies to every step including the transition into and out of step 9's history-photo card.
- On `index-v2.html`, Chapter 2's Gantt chart step visibly updates within a noticeably shorter scroll distance after its matching card enters the reading zone, compared to the current `-20%` bottom rootMargin.
- On `index-v2.html` at mobile widths, `document.body.scrollWidth` no longer exceeds `document.documentElement.clientWidth` because of Chapter 4's `.val-num` labels (verify via the same `getBoundingClientRect`-based overflow scan used during discussion, applied to every `.pyramid-align-row` instance, not just the one already found).

**Interface / data shape**: No JSON/IPC contracts — this is static HTML/CSS/JS. The one new "shape" introduced is the tag-chip markup: `<span class="pb-tag">{single trimmed keyword}</span>`, one per non-empty segment of the `關鍵字` field split on `、`.

**Failure modes**: If a project row's `關鍵字` field is missing/empty, render zero tag chips for that card (not an empty chip, not a fallback placeholder string). If the drag-to-scroll pointer sequence is interrupted (e.g. `pointerleave` fires before `pointerup`), the row must stop tracking the drag rather than leaving `scrollLeft` stuck to a stale calculation on the next unrelated pointer move.

**Acceptance criteria**:
- `diff 115MoneyDemoB-main/index.html 115MoneyDemoB-main/index-v2.html` and the equivalent for `database.html`/`database-v2.html` show zero differences immediately after the duplication task, before any fix task runs.
- After all tasks are done, `git diff -- 115MoneyDemoB-main/index.html 115MoneyDemoB-main/database.html` (the original files) shows no changes.
- Manual verification in a mobile-emulated browser (as used during `/spectra-discuss`) confirms: Chapter-2 card 1 is visible on mobile scroll; the mobile card transition is a slide, not a center-fade; `document.body.scrollWidth === document.documentElement.clientWidth` (or within a few px of normal rounding) on `index-v2.html` at a 390-430px-wide viewport.
- Manual verification on `database-v2.html` confirms tag chips appear on cards whose `關鍵字` field is non-empty, and that dragging inside a pill row with mouse-down-and-move reaches ministries/themes not visible at rest.

**Scope boundaries**: In scope — the 19 numbered items in the proposal's "Proposed Solution", applied only to the new `-v2` files. Out of scope — promoting the `-v2` files to production, any change to `index.html`/`database.html` themselves, any change to the Google Sheets data pipeline beyond reading the already-present `關鍵字` field, and the mobile-header-hamburger item (verified already correct; only a re-verify task, no fix).

## Risks / Trade-offs

- [Risk] Narrowing the IntersectionObserver `rootMargin` bottom margin from `-20%` to `-8%` could reintroduce the earlier "bar grows before card is visible" bug that a wider margin was originally added to prevent. → Mitigation: acceptance criteria requires a manual live-scroll check of Chapter 2 specifically confirming bars still only grow once their card is genuinely on-screen, not just technically intersecting at the viewport edge.
- [Risk] The translate-based mobile card transition could reintroduce the chart/card overlap bug that the pinned-band mobile layout was built to prevent, if the translate distance is large enough to visually cross into the chart's band. → Mitigation: keep the translate distance small (40px) relative to the existing safe reading zone, and re-run the existing overlap check from the prior mobile scrollytelling fix as part of verification.
- [Risk] Drag-to-scroll on `.pill-row` could interfere with normal click-to-select behavior on `.pill-btn` if a click is misinterpreted as a zero-distance drag. → Mitigation: only start scrolling once pointer movement exceeds a small threshold (e.g. 5px), so a genuine click-without-movement still reaches the button's own click handler untouched.
- [Risk] Working on duplicate files means any future edit to the live `index.html`/`database.html` (e.g. by another concurrent session, as has happened before in this repo) will not automatically carry over to `-v2`, and vice versa — the two pairs can drift. → Mitigation: this is explicitly accepted as the user's chosen approach (see proposal); reconciling drift is part of the separate, later promotion decision, not this change.

## Open Questions

- None outstanding — all ambiguities raised during `/spectra-discuss` (duplication approach, keyword-tag data source and format, and the three suspected-RWD items) were resolved with the user or confirmed live before this proposal was written.
