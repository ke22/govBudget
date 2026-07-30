## Why

The `govBudget` project uses a simplified, draft-quality CSS (`index.css`) with a different token naming convention (`--color-*`) and a stripped-down component library. The reference implementation in `deploy 3` defines the authoritative "pencil" design system — the same visual DNA (Noto Sans TC, hero blue `#355899`, Apple HIG principles) but fully realized with ~60+ tokens, a float-nav, and a complete component library. Aligning govBudget to that system eliminates visual drift and makes future cross-project work consistent.

## What Changes

- **Token system**: Replace `--color-*` variable names in `index.css` with the canonical `--pen-color-*` naming from `deploy 3`; fill in ~40 missing tokens (spacing scale `--space-1` through `--space-10`, animation curves `--ease-spring`/`--ease-out-expo`/`--ease-in-out`, full shadow system, radius variants, chart diverging palette, party colors)
- **Float-nav**: Replace the current sticky white header (`.header-inner`) with the dark vibrancy pill nav (`.float-nav`) that matches `deploy 3`'s navigation pattern
- **Component library**: Adopt the full component CSS from `deploy 3` — chip, stats-row, section-head, project-block, pen-search-bar, pen-hot-keywords, card variants — so HTML classes authored in the `deploy 3` style work in this project
- **Font alignment**: Add `Inter` to the font import alongside `Noto Sans TC` to match `deploy 3`'s webfont stack

## Non-Goals

- No restructuring of the HTML markup beyond the nav swap
- No changes to JavaScript logic or data files
- No changes to `deploy 3` — it is treated as read-only reference
- No dark mode or theme switching

## Capabilities

### New Capabilities

- `pencil-design-tokens`: The complete `--pen-color-*` / `--space-*` / `--ease-*` / `--shadow-*` / `--pencil-radius-*` CSS custom property set, matching the `deploy 3` reference
- `pencil-components`: The full component CSS library (float-nav, chip, card variants, stats-row, section-head, project-block, pen-search-bar, pen-hot-keywords) ported from `deploy 3` into `govBudget`

### Modified Capabilities

(none)

## Impact

- Affected specs: pencil-design-tokens, pencil-components
- Affected code:
  - Modified: `index.css`, `index.html`
  - New: (none)
  - Removed: (none)
