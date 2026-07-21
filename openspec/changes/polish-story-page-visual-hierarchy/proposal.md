## Why

This is Bucket 3 from `115MoneyDemoB-main/ISSUE-TRIAGE-v2.md` — smaller visual-polish items left after Buckets 1-2 closed the acceptance gaps and choreography requests. The hero's scroll indicator uses a text color explicitly authored for light card backgrounds (its own code comment says so) directly on the dark hero collage at desktop width, giving it poor contrast; the page footer shares the exact same background color as the section immediately above it (`--ui-canvas` and `--bg-deep` are literally the same hex value), so it reads as a continuation of the body rather than a distinct footer; and the hero's overdue-stamp is smaller than the reader wants, but any enlargement has to stay compliant with the collision-avoidance margin `fix-responsive-story-acceptance-gaps` already shipped for this exact element.

## What Changes

- The desktop (`≥1025px`) `.scroll-indicator` and its `::after` line switch from `--ui-muted` (authored for light-card contexts) to `--ui-ink-inverse` (already used correctly by the compact/intermediate hero's own scroll-indicator override), matching the token already proven to work against a dark background.
- `.page-footer` gains a `border-top` using the same subtle light-line-on-dark divider pattern already used elsewhere in this file (e.g. Chapter 2/3 panel borders), so it reads as visually distinct from the `.footer-cta` section immediately above it instead of blending into the identical background color.
- The `≤1024px` hero stamp (`.hero-stamp-wrap`'s `transform: scale(0.72)`) is enlarged to `scale(0.9)`, and `.hero-title`'s `margin-top` (currently `34px`, reserved by `fix-responsive-story-acceptance-gaps` for the stamp's *previous* footprint) is recomputed to `44px` to match the stamp's new, larger rendered footprint — staying compliant with `responsive-editorial-hero`'s existing "Overdue stamp position is computed relative to rendered title bounds" requirement, which is already written in footprint-agnostic terms and needs no spec text change, only a compliant implementation value.

## Non-Goals (optional)

- No change to the desktop (`≥1025px`) hero stamp's size (`128px`, `top:110px; right:13%` positioning) — that stamp already has ample clearance from the title and was not part of the original complaint, which is specifically about the ≤1024px stamp.
- **`.scroll-indicator` "centered alignment specifically below 735px"**: investigated and could not find any code-level mechanism that would lose centering at that specific width, or any breakpoint near `735px` in this file's breakpoint set (`640/968/1024/1025/1340`). The compact/intermediate hero already centers the indicator via CSS Grid (`justify-items: center`), which is not width-dependent within that range. Not implementing a guess against this sub-item — flagged for the user to reproduce/clarify with a specific viewport width and screenshot before any fix is written.
- No change to `.footer-cta`'s own background gradient — only `.page-footer`'s border, to keep the fix minimal and additive.

## Capabilities

### New Capabilities

- `story-page-visual-hierarchy-polish`: desktop scroll-indicator contrast, footer visual separation from the body, and the enlarged ≤1024px hero stamp (with its compliant collision-margin recompute).

### Modified Capabilities

(none — see "What Changes" above for the compliance note on the stamp enlargement)

## Impact

- Affected specs: `story-page-visual-hierarchy-polish` (new)
- Affected code:
  - Modified: 115MoneyDemoB-main/index-v2.html
  - New: (none)
  - Removed: (none)
