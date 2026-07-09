## Summary

Optimize the rendering and scroll performance of the `總預算卡關 203 天` scrollytelling page (index.html), prioritized for mid-range mobile devices, under the hard invariant that the rendered output stays pixel-identical before and after.

## Motivation

The page is a single 3,273-line file whose scroll-driven storytelling is implemented with patterns that cause frame drops on mid-range phones:

- Two `window.addEventListener('scroll', …)` handlers run unthrottled and non-passive; each calls `getBoundingClientRect()` and performs dozens of style/class writes on every scroll frame, causing layout thrash.
- Story bars animate `width`/`height` (`transition: width …`), which forces layout on every animation frame instead of GPU-composited compositing.
- Fixed/sticky "stage" sections rely on `100vh`, which jumps when the mobile browser address bar shows/hides.
- There is no `prefers-reduced-motion` support.

The goal is smoother scrolling and lower main-thread cost without users perceiving any visual difference.

## Proposed Solution

Apply four scoped optimizations to index.html:

1. **Scroll handlers → rAF + passive**: Coalesce the two scroll listeners into one `{ passive: true }` handler whose work runs inside a `requestAnimationFrame` callback guarded by a "ticking" flag. Read layout (`getBoundingClientRect`) once per frame, then batch DOM writes.
2. **Bar animations retain width/height (transform conversion descoped)**: The scaleX/scaleY conversion was dropped during apply. Every animated bar (`.gantt-bar-rebuilt`, `.ch3-single-bar-layer`, `#timeline-progress-bar`) has a `border-radius` that `scaleX`/`scaleY` would distort — violating pixel-identity — and these bars animate only on discrete step transitions, not per scroll frame, so transform gives negligible perf gain. The per-frame cost is instead eliminated by optimization 1 (rAF+passive). Bars keep their existing `width`/`height` animation unchanged.
3. **Mobile viewport**: Replace `100vh` on fixed/sticky stages with `100dvh` (with a `100vh` fallback) so viewport-chrome resize no longer causes jumps.
4. **Reduced motion**: Add a `@media (prefers-reduced-motion: reduce)` block that shortens/disables non-essential transitions while keeping final states identical.

Optionally (last, lowest priority) extract the inline CSS and JS into `115MoneyDemoB-main/styles.css` and `115MoneyDemoB-main/app.js` for maintainability, with byte-equivalent output.

Every change is verified by before/after screenshots at desktop and mobile widths that must match, plus a scroll-through recording confirming animation endpoints land identically.

## Non-Goals

- No changes to colors, typography, layout, copy, spacing, or any visual appearance — the rendered result must be pixel-identical.
- No redesign toward the PTS reference look; PTS informed only the target motion-smoothness quality, not the visual identity.
- No changes to database.html or other pages in this change.
- No new libraries or frameworks; the page stays vanilla HTML/CSS/JS.
- The CSS/JS file extraction is optional and may be deferred; if done, it must not alter output.

## Alternatives Considered

- **Adopt a scroll library (GSAP ScrollTrigger / scrollama)**: rejected — adds a dependency and risks visual drift; the existing hand-built approach can be made smooth with rAF alone.
- **transform: scaleX/scaleY for bar growth**: rejected during apply — all animated bars carry a `border-radius` that scaling distorts, breaking the pixel-identical invariant, and the bars do not animate per-frame, so the perf gain is negligible.
- **Full modularization / multi-file rebuild**: out of scope; the invariant is minimal-diff performance, not architecture change.

## Impact

- Affected specs: `frontend-scroll-performance` (new)
- Affected code:
  - Modified: 115MoneyDemoB-main/index.html
  - New (optional, only if extraction is performed): 115MoneyDemoB-main/styles.css, 115MoneyDemoB-main/app.js
  - Removed: none
