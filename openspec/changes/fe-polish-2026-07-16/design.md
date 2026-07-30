## Context

`115MoneyDemoB-main/index.html` (scrollytelling report) and `115MoneyDemoB-main/database.html` (searchable project database) are a linked pair of static, single-file CNA pages sharing one CSS token system (see `LEARNINGS.md`). They are about to be published/shared publicly, including inside embedded browsers such as LINE's in-app browser, which is the dominant sharing surface for Taiwanese news links. The `/fe-polish` audit (2026-07-16) found 5 P0 and 14 P1 defects spanning four independent concerns: viewport adaptivity, keyboard/screen-reader accessibility, social/SEO metadata, and browser compatibility. All fixes are additive — no existing rendering logic, data flow, or visual design is being restructured.

## Goals / Non-Goals

**Goals:**
- Eliminate the 5 P0 and 14 P1 defects identified in the audit with minimal, targeted changes.
- Keep every fix additive: new CSS declarations, new HTML attributes, new guard conditions — never remove or rewrite existing working behavior.
- Establish one consistent pattern per fix category (e.g. one debounce idiom, one `:focus-visible` treatment) so the two pages stay visually and behaviorally consistent with each other, matching the project's existing practice of porting shared tokens/patterns between the two files.

**Non-Goals:**
- `prefers-color-scheme` support, Firefox scrollbar styling, `max-height` vh caps, `database.html` body `min-height` dvh pairing, and the `body { overflow-x: hidden }` Safari sticky question — all P2, deliberately deferred (see proposal Non-Goals).
- Any change to the scrollytelling scroll-trigger logic, Gantt chart rendering, or database filter/search logic beyond the specific accessibility attributes and the one resize-debounce fix listed.
- Choosing or confirming the final publish domain — see Open Questions.

## Decisions

### Always add `dvh` as a second declaration, never replace `vh`
For every fix (`.hero-section`, `.gantt-chart-container-rebuilt` ×2, `.footer-cta`), add a second `height`/`min-height` line with the `dvh` unit immediately after the existing `vh` line. Never replace the `vh` line. This matches the existing working pattern at `index.html:670` (`height: 100vh; height: 100dvh;`) and preserves the fallback for browsers without `dvh` support, rather than introducing a new pattern.

### Debounce via `setTimeout`/`clearTimeout`, no new dependency
`updatePillRowFades` in `database.html` gets wrapped in a standard trailing-edge debounce (clear any pending timer, schedule a new one at ~150ms) around the `resize` listener specifically — the existing `scroll` listener on each `.pill-row` stays undebounced (`passive: true`, cheap, already fine) since only the `resize` path was flagged. No debounce utility library is introduced; this is a ~5-line inline pattern.

### Touch targets grow via padding, not a fixed `min-height`
`.nav-btn`, `.pill-btn`, `.page-btn` reach 44px height by increasing vertical padding (so text/border-radius proportions stay visually consistent with the existing design), rather than forcing a fixed `min-height` that could leave uneven internal whitespace at different font sizes. `.close-btn` (a single glyph with no padding today) gets explicit `min-width`/`min-height: 44px` plus `display:flex;align-items:center;justify-content:center` since it has no text content to pad around.

### `database.html` reduced-motion handling mirrors `index.html`'s existing pattern
Add a `@media (prefers-reduced-motion: reduce)` block to `database.html` that sets `.summary-bar`/`.modal-content` `animation: none` and zeroes the `transition` on `.project-block`, `.pill-btn`, `.page-btn`. This copies the structural approach already validated in `index.html:2536` rather than inventing a new reduced-motion strategy for this file.

### Modal close becomes a real `<button>`; Escape handled at `document` level
`<span class="close-btn" onclick="closeModal(true)">` becomes `<button type="button" class="close-btn" aria-label="關閉">`. A single `document.addEventListener('keydown', ...)` checks `e.key === 'Escape'` and whether `#unifiedModal` is currently visible (`style.display === 'flex'`) before calling `closeModal(true)` — added once, not per-modal-instance, since there is only one modal on this page.

### ARIA state is toggled in the same render functions that toggle the `.active` CSS class
`aria-pressed` on pill buttons is set inside `renderThemePills`/`renderMinistryPills` (database.html) at the same line that assigns `.active`, not in a separate pass. `aria-current="page"` on the current pagination button is set inside the pagination-rendering template literal alongside its `.active` class. This keeps visual state and ARIA state from ever drifting apart (the same failure mode already logged in `LEARNINGS.md` §8 for the theme-filter fields — one function updating a related piece of state while a sibling function doesn't).

### `:focus-visible` is defined per component class, not as a global catch-all
Each of `.nav-btn:focus-visible`, `.pill-btn:focus-visible`, `.page-btn:focus-visible` gets its own rule using the existing `--np-seal-red`/`--np-seal-red-bright` tokens, rather than one generic `*:focus-visible { outline: ... }` rule, so the treatment is visually intentional per component (consistent with how hover states are already defined per-component in this codebase).

### Skip link and nav `aria-current` are static HTML, not JS-driven
Both `index.html` and `database.html` already mark their current-page nav link statically in the HTML (`class="nav-btn nav-active"` is hardcoded per file, not toggled at runtime). `aria-current="page"` is therefore added as a static attribute alongside the existing static `.nav-active` class — no JavaScript required. The skip link (`<a href="#main" class="skip-link">略過導覽`) is added as the first child of `<body>` in both files, using the standard visually-hidden-until-`:focus` CSS recipe.

### JSON-LD and social meta are structured now; absolute URLs are parameterized
`meta description`, Open Graph, Twitter Card, canonical, and JSON-LD tags are added with correct field structure and Traditional-Chinese copy, but any field requiring an absolute URL (`og:url`, `canonical`, `og:image`, `twitter:image`) is written using a single `<!-- PUBLISH_BASE_URL -->`-style marker comment placed once at the top of each file's `<head>`, documenting exactly which lines need the real value substituted in. This is not a code placeholder left in application logic — it's an explicit, single, clearly-labeled substitution point for a fact (the publish domain) that isn't yet known and must not be guessed, especially since these pages carry a real news organization's branding. See Open Questions.

## Implementation Contract

**Behavior once shipped:**
- On a mobile browser with a collapsing URL bar, the hero section, Gantt chart panel, and closing CTA section no longer visibly resize/jump during scroll (verify: manual scroll test on an iOS Safari or Chrome Android device/emulator, comparing before/after).
- Resizing the browser window no longer triggers `updatePillRowFades`'s `querySelectorAll` + layout reads on every single resize event tick (verify: DevTools Performance recording during a window drag-resize shows calls throttled to ~1 per 150ms, not per-frame).
- All of `.nav-btn`, `.pill-btn`, `.page-btn`, `.close-btn` report a computed height (including padding/border) of at least 44px (verify: DevTools computed-style panel or an automated touch-target checker).
- With OS/browser "reduce motion" enabled, `database.html`'s summary bar and modal no longer animate in, and hover transitions on project cards/pills/pagination are instant (verify: enable `prefers-reduced-motion` in DevTools rendering panel, re-trigger a filter search and open the modal).
- The modal can be fully opened and closed using only the keyboard: `Tab` reaches the close button, `Enter`/`Space` activates it, and `Escape` closes the modal regardless of focus location while it's open (verify: manual keyboard-only walkthrough).
- A screen reader (VoiceOver/NVDA) announces the pagination prev/next buttons as "previous page"/"next page" (not "less than"/"greater than"), announces the currently active page as current, and announces the currently active theme/ministry filter pill as pressed (verify: manual screen-reader pass, or an axe-core/Lighthouse accessibility scan showing no button-name or aria-state violations for these elements).
- Tabbing into any nav link, filter pill, or pagination button shows a visible seal-red focus ring distinct from the hover style (verify: manual keyboard Tab-through with DevTools `:focus-visible` forced state).
- A `Tab` press as the very first keyboard action on either page reveals a "略過導覽" skip link that jumps focus to `<main>`/`#main` (verify: manual keyboard test, fresh page load).
- Sharing either page's URL to Facebook/LINE/Slack/X produces a preview card with the correct title, description, and image, once `PUBLISH_BASE_URL` is substituted (verify: paste the URL into each platform's own share-debugger tool after deployment).
- Both `window.matchMedia(...)` call sites in `index.html` (`prefers-reduced-motion` check, ch3 mobile/desktop sync check) execute a `typeof window.matchMedia === 'function'` guard first, and fall back to a safe default (motion enabled; desktop branch) when unavailable, instead of throwing (verify: temporarily stub/delete `window.matchMedia` in DevTools console and reload — page must not show a JS error in the console at these two call sites).
- Below-fold historical photos (`budget96001.jpg`, `budget96002.jpg`, `budget003.jpg`) carry `loading="lazy"`, and the hero background image has a matching `<link rel="preload" fetchpriority="high">` hint in `<head>` (verify: DevTools Network panel request-priority column, and `grep` for the attributes).

**Scope boundaries:**
- In scope: the 14 fixes enumerated in the proposal's "What Changes", across exactly `index.html` and `database.html`.
- Out of scope: everything listed under Non-Goals in the proposal and in this document; the 03_HTML yearbook files; any change to Google Sheets data-fetching logic; any redesign of visual appearance beyond what's strictly needed to hit a 44px touch target or add a focus ring.

## Risks / Trade-offs

- [Risk] Increasing button padding for touch targets could subtly shift existing layouts (e.g. pill-row horizontal spacing, header nav wrapping at the 600px breakpoint already tuned in a previous session) → Mitigation: change padding only, re-verify the existing mobile header-wrap fix (`@media (max-width:600px)` block) still doesn't reflow awkwardly after the padding increase.
- [Risk] Adding a `keydown` listener for Escape at the `document` level could in theory conflict with a future second modal on the page → Mitigation: guard the handler on `#unifiedModal`'s current visibility before acting; documented here so a future modal addition knows to extend (not duplicate) this handler.
- [Risk] The `PUBLISH_BASE_URL` marker approach means SEO tags are inert until someone substitutes the real domain → Mitigation: call this out explicitly in tasks.md as a required manual step before publish, not an automatic one.

## Migration Plan

No data migration. This is a direct edit to two static HTML files with no build step; changes take effect on next page load/deploy of the two files. No rollback mechanism beyond normal version control revert.

## Open Questions

- What is the final published base URL/domain for these two pages? Needed to fill in the `PUBLISH_BASE_URL` marker for `og:url`, `canonical`, `og:image`, and `twitter:image`. Must be confirmed with the user before publish — not to be guessed, since these pages carry CNA/中央社 branding.
