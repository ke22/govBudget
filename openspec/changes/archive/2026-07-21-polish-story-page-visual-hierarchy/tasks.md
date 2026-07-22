## 1. Desktop scroll indicator contrast

- [x] 1.1 Implement "Desktop scroll indicator uses a dark-background-safe text color" per the "Scroll-indicator contrast: reuse `--ui-ink-inverse`, the token already correct on dark backgrounds, not a new color" decision: change `.scroll-indicator`'s `color` and its `::after`'s gradient from `--ui-muted` to `--ui-ink-inverse` in the desktop (`≥1025px`-applicable, unscoped) base rule only, leaving the existing `≤1024px` override (already correct) untouched. Verification: source review confirms the base `.scroll-indicator`/`::after` rule now uses `--ui-ink-inverse` and no `--ui-muted` reference remains for this element outside the already-correct mobile override.
- [x] 1.2 Verify "Scroll indicator is legible against the dark hero collage" at 1366x768: the scroll indicator's label and line render in `--ui-ink-inverse`. Verification: computed-style read (or visual capture) at 1366x768 confirms the color value matches `--ui-ink-inverse`.

## 2. Footer visual separation

- [x] 2.1 Implement "Page footer is visually distinguished from the section above it" per the "Footer separation: a subtle `border-top` matching this file's existing dark-panel divider pattern, not a background-color change" decision: add `border-top: 1px solid rgba(237, 230, 211, 0.1)` to `.page-footer`, without changing `.footer-cta`'s background. Verification: source review confirms `.page-footer` has the new `border-top` declaration and `.footer-cta`'s CSS is unmodified.
- [x] 2.2 Verify "Footer shows a visible seam from the CTA section above it" at 1366x768 and 390x844: a visible border line separates `.page-footer` from `.footer-cta`'s background at both viewports. Verification: visual capture (or computed-style border read) at both viewports shows the border-top rendering.

## 3. Hero stamp enlargement with recomputed collision margin

- [x] 3.1 Implement "Compact and intermediate hero stamp is enlarged while remaining collision-free with the title" per the "Hero stamp enlargement: recompute the reserved margin from the same geometry model `fix-responsive-story-acceptance-gaps` used, not a new independent value" decision: change `.hero-stamp-wrap`'s `≤1024px` `transform: scale(0.72)` to `scale(0.9)`, and change `.hero-title`'s `≤1024px` `margin-top` from `34px` to `44px`. Verification: source review confirms both values are changed together in the same `≤1024px` block, matching the recomputed-margin example table in the spec.
- [x] 3.2 Verify "Enlarged stamp remains collision-free across the supported width matrix" at 320x568, 390x844, 430x932, 768x1024, 820x1180, and 1024x768 CSS pixels: the enlarged stamp's rendered bounding box and the hero title's rendered bounding box do not intersect for the current title/subtitle copy at any of these viewports. Verification: `getBoundingClientRect()` comparison (or computed geometry review using the recomputed-margin math) at each viewport shows zero intersection, re-verifying `responsive-editorial-hero`'s existing collision-avoidance scenarios against the new footprint.

## 4. Cross-cutting regression check

- [x] 4.1 Re-run the seven-viewport matrix (390x844, 430x932, 768x1024, 820x1180, 1024x768, 1366x768, 1440x900) forward/reverse scroll check already used for prior changes on this file, confirming no new overlap, clipping, or horizontal overflow was introduced by this change's hero/footer CSS edits. Verification: DOM overflow checks and scroll-through capture at all seven viewports show no regression relative to the prior baseline.
