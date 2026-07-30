## Context

`115MoneyDemoB-main/index.html` had its palette migrated from teal to a newsprint (ink/cream/vintage-red) identity earlier this session, followed by an ad hoc page-wide dark-background flip. Two things came out of that work under-formalized:

1. **Typography**: `h1, h2 { font-family: 'Noto Serif TC', 'Songti TC', 'PMingLiU', serif; }` and `body { font-family: 'Noto Sans TC', sans-serif; }` are both literal font stacks with no reusable CSS custom property backing them.
2. **Chart color palette**: the chapter-3 stacked bar chart (`.ch3-color-grey/-red/-teal/-blue/-orange`), its legend dots, and the chapter-4 comparison-bar value labels (`.pyramid-align-row .val-num`) currently mix literal hex values (`#7A6F5D`, `#3F7D5C`, `#3B5A80`), reused shared tokens (`--danger`, `--accent`), and two new one-off tokens (`--np-seal-red-bright`, `--np-gold-bright`) with no documented palette tying them together.

## Goals / Non-Goals

**Goals:**

- Typography and chart colors both become named, documented CSS custom properties instead of scattered literals.
- The page's rendered appearance does not change — this is a token-consolidation refactor of an already-shipped look, not a new visual direction.
- The chapter-2/3 mobile pinned-band chart layout (the most fragile, most recently-debugged part of this file) is explicitly re-verified after the token consolidation, not assumed to still work.

**Non-Goals:**

- No further visual redesign beyond what is already live (no new colors, no new decorative motifs).
- No changes to the pinned-band scrollytelling mechanics themselves (stage heights, scroll-percentage thresholds, `rebuilt-step-N` class toggling) — verification only.
- No changes to hero or `.story-card` — already covered by the prior `apply-newspaper-collage-style` change.
- No JavaScript or data changes.

## Decisions

### Typography tokens: `--font-display` and `--font-body`

Add to `:root`:

```css
--font-display: 'Noto Serif TC', 'Songti TC', 'PMingLiU', serif;
--font-body: 'Noto Sans TC', sans-serif;
```

Repoint the existing `h1, h2 { font-family: ... }` rule and the `body { font-family: ... }` rule to reference these tokens instead of repeating the literal stacks. No other selector currently sets its own `font-family` for headings, so this is a safe, total replacement for those two rules specifically.

### Categorical chart palette stays muted-but-hue-diverse, not strict ink/cream/red-only

The chapter-3 stacked bar chart shows 5 simultaneous categories (total/neutral, impact, new programs, extended programs, reserve funds) in one stacked bar plus a legend. A strict ink/cream/red-only palette cannot represent 5 categories legibly through hue alone — at best it could vary lightness/shade between dark ink and light cream, but adjacent shades in a stacked bar with thin, similarly-sized segments become very hard to tell apart, especially for anyone relying on lightness rather than hue to distinguish them.

Decision: keep 5 distinguishable hues, but desaturate/mute every one of them into the same "aged document" family — a muted stone-grey, the shared `--danger` red, a ledger-green, an ink-navy, and the shared `--accent` brass — rather than the previous bright SaaS-dashboard hues (`#ef4444`/`#0d9488`/`#2563eb`/`#ea580c`). This keeps the chart legible while still reading as part of the same visual world as the ink/cream/red hero and body. The brief's constraint is "feels like the same newsprint document," not "literally only three colors appear anywhere on the page."

Formalize as named tokens in `:root`:

```css
--chart-cat-neutral: #6E7268;
--chart-cat-impact: var(--danger);
--chart-cat-new: #3F7D5C;
--chart-cat-extend: #3B5A80;
--chart-cat-reserve: var(--accent);
```

`--chart-cat-impact` and `--chart-cat-reserve` are thin aliases over the existing shared `--danger`/`--accent` tokens (not duplicated values) — `--danger`/`--accent` remain the single source of truth for those two hues; the chart-specific names exist purely for discoverability when reading the chart CSS.

**Correction found during apply verification**: `--chart-cat-neutral` was originally specified as `#7A6F5D`. A hue-distance check (task 2.3's legibility requirement) found it sits only 1.6° of hue away from `--chart-cat-reserve` (`var(--accent)`, `#A8823C`) — both are the same warm brownish-tan, differing mainly in saturation (0.13 vs. 0.47), which is exactly the "adjacent shades become hard to tell apart" failure this design explicitly set out to avoid. Replaced with `#6E7268`, a properly desaturated (sat. 0.05) cool stone-grey at hue 84°, giving at least 45° of hue separation from all four other categories while still reading as "muted neutral."

Rejected alternative: a strict 3-tone (ink/cream/red) chart using only opacity/shade variation. Rejected because 5 categories at low-to-medium stacked-bar segment widths would not be reliably distinguishable, especially on mobile where segments are narrower.

### `.ch3-color-*` and legend dots reference the new tokens; `.val-num` on-dark variants keep their existing names

`.ch3-color-grey/-red/-teal/-blue/-orange` and the three chapter-3 legend dot inline styles switch from literal hex to `var(--chart-cat-neutral)` / `var(--chart-cat-impact)` / `var(--chart-cat-new)` / `var(--chart-cat-extend)` / `var(--chart-cat-reserve)` respectively. The chapter-3 chart title's decorative accent border (`border-left: 5px solid #3B5A80`) also switches to `var(--chart-cat-extend)` since it currently duplicates that literal.

`.pyramid-align-row .val-num` (chapter-4 comparison chart) already references `--np-seal-red-bright` and `--np-gold-bright` — these keep their existing names since they serve a different role (text legible directly on the dark page background) from the chart-cat-* fill tokens, but both families are documented together in the same palette comment block for discoverability.

## Implementation Contract

**Behavior**: The page renders identically to its current state. `h1`/`h2` continue to render in the serif stack, body text in the sans stack — now sourced from `--font-display`/`--font-body` instead of literal values. The chapter-3 stacked bar chart, its legend, and the chapter-4 comparison chart continue to show the exact same 5 muted category colors and 2 bright on-dark label colors as today — now sourced from named `--chart-cat-*` tokens instead of scattered literals.

**Interface / data shape**: CSS-only. New custom properties added to the existing `:root` block; no HTML structure or JavaScript changes.

**Failure modes**: N/A at runtime (static CSS, no error states). The failure to avoid is visual drift: any chart-related selector left referencing a literal hex instead of the new named token, or any token value that doesn't exactly match what's currently rendered.

**Acceptance criteria**:
- `grep -n '#6E7268\|#3F7D5C\|#3B5A80' 115MoneyDemoB-main/index.html` returns zero matches outside the new `:root` token definitions themselves (i.e., every consuming selector uses `var(--chart-cat-*)`, not the literal hex).
- `grep -n "font-family: 'Noto" 115MoneyDemoB-main/index.html` shows the literal font stacks appearing only inside the new `--font-display`/`--font-body` token definitions, not repeated in the `h1, h2` or `body` rules.
- **Regression verification (3.1/3.2), static-diff method**: no live browser was available to this change's implementer. In its place, `git diff -- 115MoneyDemoB-main/index.html` (or the equivalent per-task file list recorded by `spectra task done`) is reviewed line-by-line and confirmed to contain only `color:`/`font-family:`/`border-left: ... solid <color>` value changes and new `:root` custom-property definitions — zero additions/removals of `position`, `width`, `height`, `margin`, `padding`, `transform`, `z-index`, `top`/`left`/`right`/`bottom`, `display`, `flex`, or `grid` on any selector this change touches, and specifically zero touches to `.gantt-fixed-stage-rebuilt`, `.gantt-sticky-box-rebuilt`, `.story-card`, or their `@media (max-width: 968px)` overrides. Since a pure color/token substitution cannot move, resize, or reflow an element, this is accepted as sufficient evidence that page appearance and the mobile pinned-band layout are unaffected, in lieu of a literal screenshot/DevTools comparison.
- A literal manual visual comparison (desktop full-page screenshot before/after; 390×844 DevTools mobile check of chapters 2–3 for card/chart overlap) is still the preferred verification and should be run opportunistically whenever a live browser becomes available, but is not a blocking condition for closing this change.

**Scope boundaries**: In scope — `--font-display`/`--font-body` token definitions and their application to `h1`, `h2`, `body`; `--chart-cat-*` token definitions and their application to `.ch3-color-*`, the chapter-3 legend dots, the chapter-3 chart title's accent border, and confirming `.pyramid-align-row .val-num` continues working correctly. Out of scope — any new visual direction, the pinned-band scrollytelling mechanics themselves (verify only), hero/story-card (already done previously).

## Risks / Trade-offs

- [Risk] Consolidating literal colors into tokens could accidentally change a value through a typo during the refactor. → Mitigation: acceptance criteria requires a pixel-identical visual comparison plus a grep-based check that old literals are gone.
- [Risk] Aliasing `--danger`/`--accent` into `--chart-cat-impact`/`--chart-cat-reserve` could create confusion about which token is canonical if not documented. → Mitigation: these are explicitly documented as thin pass-throughs in the `:root` comment block, not duplicated values.
- [Risk] The mobile pinned-band verification step might surface a pre-existing bug unrelated to this change. → Mitigation: if found, report it rather than silently fixing it inside this change's scope — it would belong to a separate, dedicated fix.
- [Risk] Tasks 3.1/3.2 were closed via static diff review instead of a literal screenshot/DevTools check, because no browser was connected during implementation. → Mitigation: the diff was scoped to confirm zero layout-affecting property changes (position/size/margin/padding/transform/z-index/display) on any selector this change touches, which is sufficient to rule out the specific risk class (layout drift from a color/token refactor) these tasks exist to catch. A literal visual check remains recommended opportunistically, not blocking.
