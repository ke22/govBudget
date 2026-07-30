## Why

Earlier this session, the teal-to-newsprint token migration and a page-wide dark-background flip were done ad hoc directly in `115MoneyDemoB-main/index.html`. Typography and chart coloring came out of that work inconsistently formalized: headings use a bare `h1, h2 { font-family: ... }` rule with no reusable token, and the chart color system is a patchwork of literal hex values, reused brand tokens (`--danger`, `--accent`), and one-off tokens (`--np-seal-red-bright`, `--np-gold-bright`) introduced without a documented palette. This change formalizes both into a clean, named, reusable token system so future edits don't have to reverse-engineer scattered literals, and resolves one open design question left unaddressed: how a 5-category chart palette stays legible while still reading as "newsprint" (ink/cream/vintage-red).

## What Changes

- Introduce named typography tokens `--font-display` (serif, `Noto Serif TC`/`Songti TC`/`PMingLiU`) and `--font-body` (sans, `Noto Sans TC`), replacing the untokenized `font-family` values currently hardcoded into the `h1, h2` rule and the `body` rule.
- Formalize a documented, named chart color palette as CSS custom properties, replacing the literal hex values currently scattered across `.ch3-color-grey`/`.ch3-color-red`/`.ch3-color-teal`/`.ch3-color-blue`/`.ch3-color-orange`, `.pyramid-align-row .val-num` (left/right variants), and the chapter-3 legend dot inline styles.
- Resolve and document the design decision of whether the 5-category chart palette should collapse to a strict ink/cream/red-only family, or keep a small set of distinct-but-muted hues (current implementation uses a muted stone-grey, the shared `--danger` red, a ledger-green, an ink-navy, and the shared `--accent` brass) needed to keep 5 simultaneous categories visually distinguishable in the stacked bar chart.
- Re-verify the mobile pinned-band chart layout (chapters 2 and 3, `@media (max-width: 968px)`) still renders without card/chart overlap after the token consolidation — a verification step, not a new mechanic; the pinned-band behavior itself is out of scope for this change.

## Capabilities

### New Capabilities

- `newsprint-typography-tokens`: the named `--font-display`/`--font-body` CSS custom properties and their consistent application to heading vs. body text across the page.
- `newsprint-chart-palette`: the named, documented chart categorical color tokens (including on-dark-background "bright" text variants) that replace scattered literal hex values in the chapter-2/3 chart CSS.

### Modified Capabilities

(none — the prior newspaper-collage-style change was never archived into the canonical specs directory, so there is no on-disk spec to file a delta against; this change documents the current file state as new capabilities instead of a delta)

## Impact

- Affected specs: newsprint-typography-tokens, newsprint-chart-palette
- Affected code:
  - Modified: 115MoneyDemoB-main/index.html
  - New: (none)
  - Removed: (none)
