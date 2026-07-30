## Why

`/fe-polish` audited `115MoneyDemoB-main/index.html` and `115MoneyDemoB-main/database.html` ahead of publishing and found 5 P0 and 14 P1 defects across four dimensions: viewport adaptivity, WCAG keyboard/screen-reader access, social/SEO metadata, and browser compatibility. These pages are a CNA (Central News Agency) civic budget-review report meant for public sharing on mobile and in embedded browsers (e.g. LINE), so the gaps are user-facing now, not theoretical: the hero jumps on mobile Safari, the modal cannot be closed by keyboard at all, shared links render with no preview, and an unguarded `matchMedia()` call risks a hard crash in older embedded WebViews.

## What Changes

- Add `dvh` fallbacks to the three viewport-height rules that lack one (`.hero-section`, `.gantt-chart-container-rebuilt` ×2 cascade rules, `.footer-cta`), so layout stops jumping as the mobile browser chrome collapses/expands.
- Debounce the undebounced `resize` listener in `database.html` that recalculates pill-row scroll-fade state on every event tick.
- Increase the touch target size of `.nav-btn`, `.pill-btn`, `.page-btn`, and `.close-btn` to at least 44×44px.
- Add a `prefers-reduced-motion` guard to `database.html` (already present in `index.html`) covering its `fadeIn` animation and hover transitions.
- Make the modal's close control a real, keyboard-operable button and add an `Escape` key handler to close the modal.
- Add `aria-label` to the pagination prev/next buttons (currently only `&lt;`/`&gt;` glyphs) and `aria-current="page"` to the active page button.
- Add `aria-pressed` to the theme/ministry filter pill buttons so their selected state reaches assistive tech.
- Add a `:focus-visible` treatment to `.nav-btn`, `.pill-btn`, and `.page-btn`.
- Add a skip-to-content link and `aria-current="page"` on the active header nav item, in both pages.
- Add `<meta name="description">`, Open Graph (`og:title`/`og:description`/`og:image`/`og:url`/`og:type`), Twitter Card, and `<link rel="canonical">` tags to both pages.
- Add `Article`/`NewsArticle`-style JSON-LD structured data to both pages.
- Guard both unguarded `window.matchMedia()` call sites in `index.html` with a `typeof window.matchMedia === 'function'` feature-detection check before use.
- Add a `<link rel="preload" fetchpriority="high">` hint for the hero background image, and `loading="lazy"` to the three below-fold historical photos in `index.html`.

## Non-Goals (optional)

- `prefers-color-scheme` handling — this is a deliberate single dark-newsprint editorial theme, not a light-mode app that forgot dark mode; not in scope.
- Firefox `scrollbar-color`/`scrollbar-width` equivalents for the webkit-only `.ranking-table` scrollbar styling — cosmetic-only gap, deferred.
- `max-height: 70vh`/`90vh` viewport caps (photo frame, modal) — these are upper bounds, not fill-heights, with low visible impact from URL-bar toggling; deferred.
- `body { min-height: 100vh }` in `database.html` without a `dvh` pair — low practical impact since the filtered project list already typically exceeds viewport height; deferred.
- Investigating whether `body { overflow-x: hidden }` in `index.html` (which implicitly computes `overflow-y: auto` per the CSS spec) causes any live `position: sticky` misbehavior in Safari — manual testing this session showed the sticky header and pinned Gantt stage both working correctly; flagged for a future targeted Safari check rather than changed blindly here.
- Rewriting the underlying scrollytelling/filter JavaScript architecture — all fixes here are additive (new attributes, new media queries, new guards) and do not change existing rendering logic.

## Capabilities

### New Capabilities

- `adaptive-viewport-sizing`: Pages remain visually stable (no layout jump, adequate touch targets, respects reduced-motion) as the mobile browser's dynamic viewport and user motion preferences change.
- `accessible-interactive-controls`: Every interactive control (modal close, pagination, filter pills, nav) is operable by keyboard, has a machine-readable name, and exposes its selected/current state to assistive technology.
- `social-seo-metadata`: Both pages expose the metadata (description, Open Graph, Twitter Card, canonical, JSON-LD) needed for search indexing and clean link previews when shared.
- `resilient-browser-compat`: Pages degrade safely on older/embedded browsers (no unguarded API calls) and hint the browser's loading priority correctly for hero vs. below-fold images.

### Modified Capabilities

(none)

## Impact

- Affected specs: adaptive-viewport-sizing, accessible-interactive-controls, social-seo-metadata, resilient-browser-compat
- Affected code:
  - Modified: 115MoneyDemoB-main/index.html, 115MoneyDemoB-main/database.html
  - New: (none)
  - Removed: (none)
