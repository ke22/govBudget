## ADDED Requirements

### Requirement: Dynamic-viewport-height fallback on full-bleed sections

Any element whose visible height is set with the static `vh` unit AND is a full-bleed, view-dominant section (hero, pinned chart panel, closing CTA) SHALL also declare the same dimension using the `dvh` unit as a second, later declaration, so that the browser's dynamic viewport measurement wins in browsers that support it while `vh` remains the fallback.

#### Scenario: Hero section on a mobile browser with a collapsing URL bar

- **WHEN** a user scrolls `index.html` on a mobile browser whose URL bar collapses/expands
- **THEN** the hero section's rendered height SHALL track the dynamic viewport height and SHALL NOT visibly jump or reflow as the URL bar transitions

#### Scenario: Gantt chart inner panel stays aligned with its dvh-corrected parent stage

- **WHEN** the pinned Gantt stage's outer container resizes in response to a `dvh` change
- **THEN** the inner `.gantt-chart-container-rebuilt` panel SHALL resize by the same proportion, using its own `dvh` fallback, rather than remaining fixed at the `vh` value captured at load time

#### Scenario: Closing CTA section

- **WHEN** a user reaches the `.footer-cta` section on a mobile browser
- **THEN** its minimum height SHALL be expressed with both `vh` and `dvh` declarations

### Requirement: Resize listeners are debounced

Any `resize` event listener that triggers a layout-reading operation (querying `scrollWidth`/`clientWidth`/`getBoundingClientRect` across multiple elements) SHALL be debounced so the operation runs at most once per a fixed short delay, not once per fired event.

#### Scenario: Dragging the browser window to resize it

- **WHEN** a user drags the browser window edge to resize it, firing many `resize` events in quick succession
- **THEN** `updatePillRowFades` in `database.html` SHALL execute at most once within any 150ms window during the drag, not once per event

### Requirement: Minimum touch target size on interactive controls

Every clickable/tappable control that is a `<button>` or `<a>` styled as a button (`.nav-btn`, `.pill-btn`, `.page-btn`, `.close-btn`) SHALL have a computed height (including padding and border) of at least 44 CSS pixels.

#### Scenario: Filter pill on a phone-width viewport

- **WHEN** a user views the theme/ministry filter pills on a viewport narrower than 600px
- **THEN** each `.pill-btn`'s computed box height SHALL be at least 44px

#### Scenario: Modal close control

- **WHEN** a user views the open project-detail modal
- **THEN** the close control's computed box height and width SHALL each be at least 44px

### Requirement: Reduced-motion preference is honored on both pages

Both `index.html` and `database.html` SHALL disable non-essential CSS animations and shorten transitions to near-zero duration when the user agent reports `prefers-reduced-motion: reduce`.

#### Scenario: Reduced motion enabled while filtering the database

- **WHEN** a user with `prefers-reduced-motion: reduce` enabled performs a search on `database.html`
- **THEN** the `.summary-bar` and `.modal-content` `fadeIn` animation SHALL NOT play, and hover transitions on `.project-block`, `.pill-btn`, and `.page-btn` SHALL be instant
