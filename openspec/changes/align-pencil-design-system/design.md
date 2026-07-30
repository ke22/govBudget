## Context

`govBudget/index.css` is a ~225-line draft CSS that shares the visual intent of the `deploy 3` pencil design system but uses a different, abbreviated token convention (`--color-*`) and omits most components. The reference implementation, `deploy 3/styles_vs.css` (2562 lines), is the authoritative "pencil-new.pen" design system.

`govBudget/index.html` contains ~50 inline `var(--color-*)` references and a sticky white header that must be updated as part of the token migration.

## Goals / Non-Goals

**Goals:**
- Replace `index.css` with a full pencil design system CSS that matches `deploy 3/styles_vs.css` token names and component library
- Update all `var(--color-*)` references in `index.html` to the canonical `--pen-color-*` equivalents
- Swap the sticky white header in `index.html` for the float-nav dark pill component
- Add `Inter` to the Google Fonts import

**Non-Goals:**
- Restructuring any HTML sections beyond the nav/header swap
- Changing JavaScript logic, data files, or chart configuration
- Modifying `deploy 3` source files
- Implementing dark mode or theme switching

## Decisions

### Decision 1: Full CSS replacement vs. incremental patch

**Choice**: Full replacement — overwrite `index.css` with the complete pencil token set and component library copied from `deploy 3/styles_vs.css`, then add any govBudget-specific overrides at the bottom.

**Rationale**: The two files share almost no class names. A diff-based patch would be longer and more error-prone than a clean replacement. govBudget-specific editorial layout (`.main-wrapper`, `.hero`, `.article-meta`) exists only in `<style>` blocks inside `index.html`, not in `index.css`, so it is unaffected.

**Alternative rejected**: Keeping the old `--color-*` aliases as compatibility shims pointing to the new `--pen-color-*` tokens. Rejected because it perpetuates the naming debt and adds indirection with no benefit since all callers are in the same project.

### Decision 2: Token migration strategy

**Choice**: Direct rename — update every `var(--color-*)` call in `index.html` to its `--pen-color-*` equivalent per the mapping table below, then delete the old `--color-*` definitions.

| Old token | New token |
|---|---|
| `--color-primary` | `--pen-color-text` |
| `--color-accent` | `--pen-color-hero-blue` |
| `--color-accent-hover` | `--pen-color-pass` (deep blue) or inline `#1f4e86` |
| `--color-bg` | `--pen-color-surface` |
| `--color-card` | `--pen-color-surface-elevated` |
| `--color-border` | `--pen-color-border` |
| `--color-border-light` | `--pen-color-divider` |
| `--color-text` | `--pen-color-text` |
| `--color-text-light` | `--pen-color-text-muted` |
| `--color-danger` | `--pen-color-cut` |

### Decision 3: Float-nav HTML structure

**Choice**: Replace the `<header>` element in `index.html` with the `.float-nav` markup pattern from `deploy 3/index.html`, preserving the existing nav link labels (首頁, 預算查詢, 立委提案, 其他).

The float-nav requires:
- A `<nav class="float-nav" ...>` wrapper with brand + seg + iconBtn children
- A `<a class="skip-link" href="#main">` accessibility link before the nav
- Body padding-top adjustment (the float-nav is `position:fixed` so content must clear it)

## Implementation Contract

**Observable behavior**: After this change, `govBudget` visually matches `deploy 3` — dark pill floating nav, same color palette, same card/button/chip appearance. No content changes, no functional changes.

**Token contract**: All CSS custom properties in `index.css` use the `--pen-*` / `--pencil-*` prefix namespace. No `--color-*` tokens exist in `index.css` or in any inline style in `index.html`.

**Float-nav contract**: The `<header>` element is removed. A `<nav class="float-nav">` element is the first child of `<body>` (after the skip-link). It contains a brand link (`.float-nav__brand`), a segment tab group (`.float-nav__seg`) with four `.float-nav__btn` items, and one icon button (`.float-nav__iconBtn`). The nav JavaScript (collapse-on-resize, `is-open` toggle) is wired up or left as a progressive enhancement stub.

**Acceptance criteria**:
1. Open `index.html` in a browser — the dark pill nav appears at the top, matching `deploy 3`
2. All card, button, chip, stat elements use the correct pencil colors (hero blue `#355899`, surface `#f7f8fb`, text `#1c1c1e`)
3. No browser console errors about undefined CSS custom properties (`getComputedStyle` check)
4. `grep -r '\-\-color-' index.html index.css` returns zero results

**Scope boundary**: Only `index.css` and `index.html` are modified. All other files are out of scope.

## Risks / Trade-offs

- `index.html` inline `<style>` blocks use `var(--color-*)` — these must be updated alongside `index.css`, not just the external stylesheet
- The float-nav is `position:fixed`, so the first `<section>` in `index.html` needs `padding-top: calc(var(--float-nav-h) + var(--space-7))` to avoid content hiding under the nav
- `deploy 3/styles_vs.css` references `./img/image%2010.*` background images — those paths must be stripped or redirected when copying the hero CSS, since `govBudget` has different assets
