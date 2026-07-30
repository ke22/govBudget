## 1. Typography tokens

- [x] 1.1 Add `--font-display` and `--font-body` custom properties to `:root` and repoint the existing `h1, h2` and `body` `font-family` rules to reference them, per "Typography tokens: `--font-display` and `--font-body`", delivering "Display and body text use named typography tokens". Verify with `grep -n "font-family: 'Noto" 115MoneyDemoB-main/index.html` showing the literal font stacks only inside the two new token definitions, not repeated in the `h1, h2` or `body` rules.

## 2. Chart palette tokens

- [x] 2.1 Add the five `--chart-cat-*` custom properties (`--chart-cat-neutral`, `--chart-cat-impact`, `--chart-cat-new`, `--chart-cat-extend`, `--chart-cat-reserve`) to `:root` with the exact values from "Categorical chart palette stays muted-but-hue-diverse, not strict ink/cream/red-only", delivering "Chart categorical colors are named tokens, not literal hex values". Verify with `grep -n -- '--chart-cat-' 115MoneyDemoB-main/index.html` returning all five token definitions.
- [x] 2.2 Repoint `.ch3-color-grey/-red/-teal/-blue/-orange`, the three chapter-3 legend dot inline styles, and the chapter-3 chart title's decorative accent border to reference the corresponding `--chart-cat-*` token, per "`.ch3-color-*` and legend dots reference the new tokens; `.val-num` on-dark variants keep their existing names". Verify with `grep -n '#7A6F5D\|#3F7D5C\|#3B5A80' 115MoneyDemoB-main/index.html` returning matches only inside the `:root` token definitions from task 2.1, nowhere else.
- [x] 2.3 Confirm "Chart categorical palette preserves 5-way legibility": at a 390px-wide mobile viewport (DevTools device mode), visually verify all 5 stacked-bar category segments in chapter 3 remain distinguishable from each other by hue. Verify by manual visual inspection; if any two segments are hard to tell apart, report it rather than silently retinting.
- [x] 2.4 Confirm "On-dark comparison-chart labels remain legible": visually verify the chapter-4 comparison chart's left (`--np-seal-red-bright`) and right (`--np-gold-bright`) value labels are clearly readable against the dark `--bg-deep` page background. Verify by manual visual inspection at both desktop and 390px mobile widths.

## 3. Regression verification

- [x] 3.1 Confirm the page's rendered appearance is unchanged by this token consolidation (per the Implementation Contract's "page renders identically" behavior). Verify by comparing a full-page screenshot taken before this change's edits against one taken after, at a standard desktop width (e.g. 1280px).
- [x] 3.2 Confirm the mobile pinned-band chart layout for chapters 2 and 3 still renders without card/chart overlap after the token consolidation, matching the behavior already verified working earlier this session. Verify at a 390×844 mobile viewport (DevTools device mode): the pinned chart band renders correctly and the `.story-card` in each chapter does not visually overlap the chart.
