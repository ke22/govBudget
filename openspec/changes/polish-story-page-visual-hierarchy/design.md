## Context

Three small, unrelated-but-adjacent visual-polish requests from `ISSUE-TRIAGE-v2.md` Bucket 3. The hero's `.scroll-indicator` at desktop width (`≥1025px`) uses `color: var(--ui-muted)` — a token whose own code comment states it was authored for light-card body text, not for placement directly on the dark hero collage image. `.page-footer` uses `background: ... var(--ui-canvas)`, and `--ui-canvas` (`#12191A`) is the identical hex value as `--bg-deep`, which `.footer-cta` (the section immediately above the footer) fades into — the footer is visually indistinguishable from the body content above it. The `≤1024px` hero stamp (`.hero-stamp-wrap { transform: scale(0.72) }`, base `.hero-stamp` 84×84px) was reserved a `34px` `margin-top` on `.hero-title` by `fix-responsive-story-acceptance-gaps`, sized to that stamp's specific rendered footprint — enlarging the stamp without recomputing that margin would silently reintroduce the exact collision that change fixed.

## Goals / Non-Goals

**Goals:**

- Fix the desktop scroll-indicator's contrast by reusing the token already proven correct on dark backgrounds elsewhere in this file.
- Give the footer a visible seam from the body above it, minimally and consistently with this file's existing dark-panel divider convention.
- Enlarge the `≤1024px` hero stamp while keeping it compliant with the already-shipped, footprint-agnostic collision-avoidance requirement.

**Non-Goals:**

- No change to the desktop (`≥1025px`) hero stamp's size or position — not part of the original complaint, and it already has ample clearance.
- No fix attempted for the "`.scroll-indicator` centered alignment below 735px" sub-claim — no matching breakpoint or centering-loss mechanism found in the code; flagged for the user to reproduce before any code is written against it.
- No change to `.footer-cta`'s own background gradient.

## Decisions

### Scroll-indicator contrast: reuse `--ui-ink-inverse`, the token already correct on dark backgrounds, not a new color

Two options: (a) introduce a new dedicated color token for the scroll indicator; (b) reuse `--ui-ink-inverse` (`#EDE6D3`, a near-white cream), which the compact/intermediate hero's own `.scroll-indicator` override at `≤1024px` already uses successfully against the same kind of dark hero background.

**Chosen: (b).** The compact/intermediate hero already solved this exact contrast problem for the same element with an existing token — applying the same token at desktop width is a one-line fix that reuses proven-correct styling instead of inventing a new color for an already-solved problem.

### Footer separation: a subtle `border-top` matching this file's existing dark-panel divider pattern, not a background-color change

Two options: (a) change `.page-footer`'s background to a genuinely different shade from `--ui-canvas`/`--bg-deep`; (b) add a `border-top: 1px solid rgba(237, 230, 211, 0.1)` — the exact divider pattern already used for Chapter 2/3 panel borders in this file (e.g. `.rebuilt-step-2 .gantt-chart-container-rebuilt`'s `border: 1px solid rgba(237, 230, 211, 0.1)`).

**Chosen: (b).** A new background shade risks looking like an arbitrary, unrelated color choice; the existing subtle light-line-on-dark border is already this file's established visual language for "here's a boundary," recognizable and consistent with the rest of the report.

### Hero stamp enlargement: recompute the reserved margin from the same geometry model `fix-responsive-story-acceptance-gaps` used, not a new independent value

Two options: (a) enlarge the stamp and pick a new margin value by eye; (b) recompute the margin using the identical geometry model (untransformed wrap box, scale-from-center transform, arrow pseudo-element) `fix-responsive-story-acceptance-gaps`'s design.md already worked out for this exact element, just with the new scale factor.

**Chosen: (b).** Picking a margin "by eye" is exactly the kind of two-independently-authored-values drift Bucket 1 was written to eliminate. Recomputing from the same model: `.hero-stamp-wrap` unscaled box (`top:-26px`, height `84px`) has origin y `16` (its own midpoint); the arrow pseudo-element's unscaled bottom edge is `72` (measured from the same origin frame Bucket 1 documented). At the new `scale(0.9)`, the arrow's rendered bottom is `16 + (72 - 16) × 0.9 = 66.4px` (panel-relative). `.hero-headline-panel`'s `padding-top` is unchanged at `30px`, so `.hero-title`'s `margin-top` must exceed `66.4 - 30 = 36.4px`; chosen value `44px` leaves a `7.6px` buffer, consistent with Bucket 1's own ~`7.68px` buffer convention.

## Implementation Contract

- **Behavior**: (1) at `≥1025px`, `.scroll-indicator` and its `::after` line render in `--ui-ink-inverse` instead of `--ui-muted`; (2) `.page-footer` shows a visible top border separating it from `.footer-cta`'s background; (3) at `≤1024px`, the hero stamp renders at `scale(0.9)` (up from `0.72`) and `.hero-title`'s `margin-top` is `44px` (up from `34px`), with the stamp and title's rendered bounding boxes still not intersecting for the current title/subtitle copy at the same viewport matrix `fix-responsive-story-acceptance-gaps` verified (320×568 through 1024×768).
- **Interface/data shape**: CSS-only; no new JS, no new custom properties beyond reusing `--ui-ink-inverse`.
- **Failure modes**: none — purely presentational, no runtime behavior introduced.
- **Acceptance criteria**: at 1366×768, the scroll indicator's text/line color is `--ui-ink-inverse` (visually higher contrast against the dark collage than the previous `--ui-muted`); the footer shows a visible border seam at any viewport; at 320×568, 390×844, 430×932, 768×1024, 820×1180, and 1024×768, the enlarged stamp's rendered bounding box and the hero title's rendered bounding box do not intersect for the current copy (re-verifying `responsive-editorial-hero`'s existing scenarios against the new, larger footprint).
- **Scope boundaries**: in scope — `.scroll-indicator`/`::after` color at `≥1025px`, `.page-footer`'s border, `.hero-stamp-wrap`'s `≤1024px` scale, and `.hero-title`'s `≤1024px` `margin-top`, all within `115MoneyDemoB-main/index-v2.html`. Out of scope — the "735px" alignment sub-claim, `.footer-cta`'s background, the desktop hero stamp.

## Risks / Trade-offs

- [The recomputed `44px` margin is, like Bucket 1's `34px`, a worst-case geometric estimate rather than a live-measured value] → Mitigation: the acceptance criteria explicitly re-verify collision-freedom at all six viewports `fix-responsive-story-acceptance-gaps` already established as the matrix for this exact check, so the same verification discipline carries forward.
- [Leaving the "735px" alignment sub-claim unresolved means Bucket 3 doesn't fully close the original triage note] → Mitigation: explicitly flagged in the proposal's Non-Goals rather than silently dropped or guessed at, so it stays visible as a follow-up rather than looking closed.
