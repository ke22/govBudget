## 1. Baseline capture (visual invariant guardrail)

- [ ] 1.1 Capture a pre-optimization visual baseline: full-page screenshots of 115MoneyDemoB-main/index.html at desktop width (~1280px) and mobile width (~390px) across all four chapters, plus a scroll-through screen recording of every scroll-driven animation (timeline progress, Gantt bars, chapter-3 ratio/donut switch, chapter-4 ranking reveals). Save to the scratchpad as the reference set. Done when both widths × all chapters are captured and the recording shows every animation reaching its end state.

## 2. Scroll handler optimization (rAF + passive)

- [x] 2.0 Implements requirement "Scroll handlers run passively and are frame-throttled" (verification captured in tasks 2.1–2.2 below).
- [x] 2.1 In 115MoneyDemoB-main/index.html, coalesce the two `window.addEventListener('scroll', …)` handlers (the chapter-2 Gantt physics handler and the second scroll handler) into a single listener registered with `{ passive: true }`. Behavior: scrolling is never blocked by the listener. Verify with DevTools event-listener inspection showing `passive: true` and no `preventDefault` in the handler.
- [x] 2.2 Wrap the per-frame work in a `requestAnimationFrame` callback guarded by a `ticking` boolean flag so the scroll math runs at most once per frame. Read all layout values (`getBoundingClientRect`) first, then perform DOM/class writes, so no read follows a write within a frame. Behavior: chapter-2 stage activation, progress percentage, and step classes update identically to before. Verify by scrolling chapter 2 and confirming the Gantt steps trigger at the same scroll positions as the baseline recording; confirm in a DevTools Performance trace that no forced-reflow warning fires inside the handler.

## 3. Bar animation fidelity (descoped — bars retain width/height)

Covers requirement: Bar animations preserve rounded-corner fidelity.

Decision (recorded during apply): the transform:scaleX/scaleY conversion is NOT performed. Every animated bar (`.gantt-bar-rebuilt` 2px radius, `.ch3-single-bar-layer` 8px radius, `#timeline-progress-bar`) carries a `border-radius` that `scaleX`/`scaleY` would distort, breaking the pixel-identical invariant; and these bars animate only on discrete step transitions (not per scroll frame), so transform yields negligible performance gain. The per-frame cost they were blamed for is fully removed by the task 2 rAF+passive handler instead.

- [x] 3.1 Confirm no bar animation is converted to transform: verify `.gantt-bar-rebuilt`, `.ch3-single-bar-layer`, and `#timeline-progress-bar` still animate via `width`/`height` in the final file, so their rounded corners render identically to the baseline. Done when a grep for `scaleX`/`scaleY` on these bars returns nothing and their `transition` still targets `width`/`height`.

## 4. Mobile viewport height

- [x] 4.0 Implements requirement "Fixed and sticky stages use dynamic viewport height" (verification captured in task 4.1 below).
- [x] 4.1 Replace `100vh` with `100dvh` on the fixed/sticky stage sections (the chapter-2 `.gantt-fixed-stage-rebuilt` stage and any full-viewport-height sticky wrapper), keeping a `100vh` declaration immediately before the `100dvh` one as a fallback for unsupported browsers. Behavior: on a mobile browser the stage no longer resizes or jumps when the address bar collapses/expands. Verify on a mobile viewport (or device emulation with dynamic toolbar) by scrolling through chapter 2 and confirming the stage height stays visually stable versus the previous jump.

## 5. Reduced motion

- [x] 5.0 Implements requirement "Reduced-motion preference is honored" (verification captured in task 5.1 below).
- [x] 5.1 Add a `@media (prefers-reduced-motion: reduce)` block to 115MoneyDemoB-main/index.html that shortens or disables non-essential transitions (scroll-reveal opacity/transform fades) while leaving every element's final rendered state identical to the default. Behavior: with the OS reduced-motion setting on, the page shows the same final content with minimal animation. Verify by enabling `prefers-reduced-motion: reduce` in DevTools rendering emulation and confirming all content reaches the same end states as the baseline with no missing elements.

## 6. Visual invariant verification

- [ ] 6.0 Implements requirement "Visual output is pixel-identical after optimization" (verification captured in tasks 6.1–6.2 below).
- [ ] 6.1 Re-capture screenshots and a scroll-through recording at the same desktop and mobile widths as task 1.1, then diff against the baseline. Behavior: the optimized page is pixel-identical (no perceptible difference) at every captured scroll position, and every animation reaches the same start/end state. Done when the before/after comparison shows no visual difference across all four chapters at both widths.
- [ ] 6.2 Confirm the performance win on a throttled profile: run a DevTools Performance trace (4× CPU throttle, mobile emulation) scrolling through the full page before and after, and record that scripting/rendering main-thread time during scroll is reduced and no forced-reflow warnings occur in the scroll handlers. Done when the after-trace shows lower main-thread cost than the before-trace with no reflow warnings.
