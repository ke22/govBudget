## ADDED Requirements

### Requirement: Modal is fully keyboard-operable

The project-detail modal on `database.html` SHALL be openable, navigable, and closable using only the keyboard. Its close control SHALL be a semantic, focusable `<button>` element, and the `Escape` key SHALL close the modal whenever it is open, regardless of which element currently holds focus.

#### Scenario: Closing the modal with the keyboard

- **WHEN** a user opens a project's detail modal and presses `Tab` until the close button receives focus, then presses `Enter`
- **THEN** the modal SHALL close

#### Scenario: Closing the modal with Escape

- **WHEN** the modal is open and the user presses the `Escape` key, regardless of current focus location on the page
- **THEN** the modal SHALL close

### Requirement: Pagination controls expose accessible names and current state

The pagination previous/next buttons SHALL carry an `aria-label` describing their action, and the button representing the currently displayed page SHALL carry `aria-current="page"`.

#### Scenario: Screen reader announces pagination controls

- **WHEN** a screen reader user navigates to the pagination previous button
- **THEN** it SHALL be announced using its `aria-label` (e.g. "上一頁"), not the literal `<` glyph

#### Scenario: Current page is announced

- **WHEN** a screen reader user navigates through the pagination page-number buttons
- **THEN** the button matching the currently displayed page SHALL be announced as the current page

### Requirement: Filter pills expose pressed state to assistive technology

Each theme and ministry filter `.pill-btn` SHALL carry `aria-pressed="true"` when its filter is the currently active selection, and `aria-pressed="false"` otherwise, updated at the same point the `.active` CSS class is toggled.

#### Scenario: Selecting a theme filter

- **WHEN** a user selects the "國防安全" theme pill
- **THEN** that pill's `aria-pressed` attribute SHALL be `"true"` and every other theme pill's `aria-pressed` attribute SHALL be `"false"`

### Requirement: Visible focus indication on interactive controls

`.nav-btn`, `.pill-btn`, and `.page-btn` SHALL each display a visible focus ring, distinct from their hover style, when reached via keyboard navigation (`:focus-visible`).

#### Scenario: Tabbing through the header navigation

- **WHEN** a keyboard user presses `Tab` and focus lands on a `.nav-btn`
- **THEN** a visible focus ring SHALL appear around that element

### Requirement: Pages provide a skip-to-content link and current-page nav indication

Both `index.html` and `database.html` SHALL provide a skip link, visually hidden until focused, as the first focusable element on the page, that moves focus to the main content region. The header nav link representing the current page SHALL carry `aria-current="page"`.

#### Scenario: First Tab press on page load

- **WHEN** a keyboard user presses `Tab` immediately after either page loads
- **THEN** a "略過導覽" skip link SHALL become visible and, when activated, SHALL move focus to the main content region

#### Scenario: Current page indicated to assistive technology

- **WHEN** a screen reader user reaches the header navigation on `database.html`
- **THEN** the "完整資料庫" link SHALL be announced as the current page
