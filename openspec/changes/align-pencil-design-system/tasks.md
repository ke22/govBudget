## 1. Replace CSS Token System

- [x] 1.1 Satisfy **Token Namespace**, **Color Palette**, **Spacing Scale**, **Animation Curves**, **Shadow System**, and **Radius Scale** requirements (Decision 1: full CSS replacement — not incremental patch) by overwriting `index.css` with the full pencil design system token block: copy the entire `:root { ... }` section from `deploy 3/styles_vs.css` verbatim, including all `--pen-color-*`, `--space-1` through `--space-10`, `--ease-spring`/`--ease-out-expo`/`--ease-in-out`, `--shadow-sm`/`--shadow-md`/`--shadow-lg`/`--shadow-xl`, `--pencil-radius`/`--pencil-radius-lg`/`--pencil-radius-pill`, `--chart-*`, `--party-*`, and derived alias tokens. Verify: open `index.html` in a browser — card backgrounds are `#f7f8fb` and accent elements are `#355899`.
- [x] 1.2 Update the Google Fonts import in `index.html` to load both `Noto Sans TC` (weights 400;500;700;900) and `Inter` (weights 400;500;700). Verify: browser DevTools Network panel shows both font families loaded.

## 2. Migrate Token References in index.html

- [x] 2.1 Satisfy **Token Namespace** by replacing all `var(--color-primary)` occurrences in `index.html` inline `<style>` blocks and inline `style=` attributes with `var(--pen-color-text)` (Decision 2: token migration strategy). Verify: `grep 'color-primary' index.html` returns zero results.
- [x] 2.2 Replace all `var(--color-accent)` occurrences in `index.html` with `var(--pen-color-hero-blue)` per the Decision 2 mapping table. Verify: `grep 'color-accent[^-]' index.html` returns zero results.
- [x] 2.3 Replace all remaining `--color-*` tokens throughout `index.html`: `var(--color-bg)` → `var(--pen-color-surface)`, `var(--color-card)` → `var(--pen-color-surface-elevated)`, `var(--color-border)` → `var(--pen-color-border)`, `var(--color-border-light)` → `var(--pen-color-divider)`, `var(--color-text-light)` → `var(--pen-color-text-muted)`, `var(--color-danger)` → `var(--pen-color-cut)`. Verify: `grep '\-\-color-' index.html` returns zero results.
- [x] 2.4 Delete the old `--color-*` token definitions from `index.css` (Decision 2: no compatibility shims). Verify: `grep '\-\-color-' index.css` returns zero results.

## 3. Port Full Component Library

- [x] 3.1 Satisfy **Card Component**, **Button Component**, and **Chip Component** requirements (Decision 1: full CSS replacement) by copying `.card` variants (`.card--tight`, `.card--pad`, `.card--interactive`, `.card--roomy`), `.btn` variants (`.btn--primary`, `.btn--outline`, `.btn--ghost`), `.field`, `.select`, and `.chip` CSS from `deploy 3/styles_vs.css` into `index.css`. Verify: buttons render with `border-radius: 999px` and primary buttons are `#355899`; cards have `border-radius: var(--pencil-radius-lg)` and `background: var(--pen-color-surface)`.
- [x] 3.2 Satisfy **Search Bar Component**, **Project Block Component**, **Stat Block Component**, and **Section Head Component** requirements by copying `.pen-search-bar`, `.pen-hot-keywords`, `.pen-keyword-chip`, `.project-block`, `.pb-info`, `.pb-dept`, `.pb-title`, `.pb-amount`, `.pen-stats-row`, `.pen-stat-block`, `.pen-stat-divider`, `.pen-section-head`, `.pen-triangle`, and `.pen-summary-cards` CSS from `deploy 3/styles_vs.css` into `index.css`. Verify: each of these selectors appears in `index.css` and applies the correct styles when added to a test element in `index.html`.
- [x] 3.3 Copy the base reset, body, layout primitives (`.l-measure`, `.l-frame`, `.container`, `.stack`, `.grid`, `.section`), `.visually-hidden` utility, `.animate-in` / `.animate-in.is-in` scroll-reveal helper, and `@media (prefers-reduced-motion: reduce)` override from `deploy 3/styles_vs.css` into `index.css`. Verify: the existing editorial layout in `index.html` still renders correctly (no layout breakage visible in browser).

## 4. Float-Nav: Replace Header

- [x] 4.1 Satisfy **Skip Link Accessibility** requirement by adding a `.skip-link` anchor as the first child of `<body>` in `index.html`, pointing to `#main`, styled visually hidden until focused (per `.skip-link` CSS from `deploy 3/styles_vs.css`). Verify: tabbing to the page's first focusable element shows the skip link at `top: 16px; left: 16px` with a visible border and shadow.
- [x] 4.2 Copy the `.float-nav` full CSS block (including `.float-nav__brand`, `.float-nav__seg`, `.float-nav__btn`, `.float-nav__menuBtn`, `.float-nav__menuIcon`, `.float-nav__iconBtn`, `.nav-active`, and responsive collapse rules) from `deploy 3/styles_vs.css` into `index.css` (Decision 3: Float-Nav HTML structure). Verify: these selectors exist in `index.css` with no CSS syntax errors (`index.css` passes browser stylesheet parsing without errors).
- [x] 4.3 Satisfy **Float-Nav Component** requirement by replacing the `<header>` element in `index.html` with `<nav class="float-nav" id="float-nav" aria-label="主選單">` containing: a brand link (`.float-nav__brand`), a segment group (`.float-nav__seg`) with four `.float-nav__btn` links (首頁, 預算查詢, 立委提案, 其他), and a menu icon button (`.float-nav__menuBtn`). Verify: the old sticky white header is absent; the dark vibrancy pill nav (`rgba(16,27,31,0.78)` background with blur) is visible at the top of the viewport.
- [x] 4.4 Add `padding-top: calc(var(--float-nav-h) + var(--space-7))` to the first content section in `index.html` so body content clears the fixed float-nav. Verify: the first visible content section is fully visible below the nav with no overlap.
- [x] 4.5 Wire float-nav collapse behavior: add a `<script>` block in `index.html` that toggles `.is-collapsed` on `#float-nav` when viewport width < 600px (via `ResizeObserver` or `window.resize`) and toggles `.is-open` when `.float-nav__menuBtn` is clicked. Verify: at viewport width < 600px the segment tabs are hidden and the menu button appears; clicking it shows the dropdown tabs.

## 5. Hero Image Path Cleanup

- [x] 5.1 Audit `index.css` after the copy from `deploy 3` for any `url("./img/image%2010.*")` or other asset paths referencing `deploy 3`-specific images, and remove or replace those background-image declarations with `none` or the correct `govBudget` asset path. Verify: no browser console 404 errors for missing images originating from the copied CSS.

## 6. Final Acceptance Check

- [x] 6.1 Run `grep -r '\-\-color-' index.html index.css` and confirm zero results. This verifies the complete token migration.
- [x] 6.2 Open `index.html` in a browser and confirm: dark pill float-nav visible at top, card backgrounds are `#f7f8fb`, primary buttons are `#355899`, and no console errors about undefined CSS custom properties.
