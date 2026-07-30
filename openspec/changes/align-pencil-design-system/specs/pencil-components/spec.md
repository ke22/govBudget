## ADDED Requirements

### Requirement: Float-Nav Component

The page SHALL have a `<nav class="float-nav">` element as the primary navigation, styled as a dark vibrancy pill fixed at the top of the viewport.

#### Scenario: Float-nav renders correctly

- **WHEN** the page loads in a browser
- **THEN** a dark pill navigation bar (`background: rgba(16,27,31,0.78)`, `backdrop-filter: blur`) is visible at the top, centered horizontally, with `border-radius: var(--pencil-radius-lg)`
- **THEN** the legacy `<header>` element with white background is absent

#### Scenario: Float-nav contains navigation links

- **WHEN** the float-nav is rendered
- **THEN** it contains a brand link and a segment group with four navigation items: 首頁, 預算查詢, 立委提案, and 其他

#### Scenario: Float-nav collapses on narrow viewports

- **WHEN** the viewport width is below 600px
- **THEN** the segment group is hidden and a menu icon button (`.float-nav__menuBtn`) is shown
- **WHEN** the menu button is clicked
- **THEN** the segment group appears as a dropdown below the pill (`is-open` state)

### Requirement: Card Component

The `.card` CSS class SHALL produce a surface container with `background: var(--pen-color-surface)`, `border-radius: var(--pencil-radius-lg)`, `border: 1px solid rgba(20,22,29,0.10)`, and a `box-shadow: var(--shadow-sm)`.

#### Scenario: Card hover interaction

- **WHEN** a user hovers over a `.card` element
- **THEN** the card translates up by 1px (`translateY(-1px)`) using the `--ease-spring` transition

### Requirement: Button Component

The `.btn` CSS class SHALL produce a pill-shaped interactive control (`border-radius: 999px`, height `40px`–`46px`). Variants:
- `.btn--primary`: `background: var(--pen-color-hero-blue)`, white text
- `.btn--outline`: white background, hero-blue text, hero-blue border
- `.btn--ghost`: transparent background

#### Scenario: Primary button focus ring

- **WHEN** a `.btn--primary` receives keyboard focus
- **THEN** a visible focus ring of `box-shadow: 0 0 0 4px rgba(29,47,85,0.22)` is shown

### Requirement: Chip Component

The `.chip` CSS class SHALL produce a pill-shaped filter control (`border-radius: 999px`, height `34px`) with `background: rgba(49,84,147,0.06)` and `font-weight: 750`.

#### Scenario: Chip renders as a pill shape

- **WHEN** an element with class `chip` is rendered
- **THEN** it has `height: 34px`, `border-radius: 999px`, and a blue-tinted background (`rgba(49,84,147,0.06)`)

### Requirement: Search Bar Component

The `.pen-search-bar` component SHALL be a full-width search input with a pill border (`border-radius: var(--pencil-radius-pill)`), height `56px`, and an embedded submit button on the right.

#### Scenario: Search bar focus state

- **WHEN** the search input is focused
- **THEN** `border-color: var(--pen-color-hero-blue)` and `box-shadow: 0 0 0 4px rgba(29,47,85,0.14)` are applied

### Requirement: Project Block Component

The `.project-block` CSS class SHALL produce a row-layout content card with `border-radius: var(--pencil-radius-lg)`, `min-height: 88px`, department badge (`.pb-dept`), title (`.pb-title`), and amount (`.pb-amount`).

#### Scenario: Project block renders as a horizontal row

- **WHEN** a `.project-block` element is rendered with children `.pb-dept`, `.pb-title`, and `.pb-amount`
- **THEN** the layout is `flex-direction: row` with `min-height: 88px` and a pill-shaped department badge (`.pb-dept`) on the left

### Requirement: Stat Block Component

The `.pen-stat-block` CSS class SHALL produce a centered column with a large numeric value (`.val`, font-size `clamp(1.75rem, 7vw, 2.5rem)`, `font-family: var(--font-mono)`) and a muted label (`.label`).

#### Scenario: Stat block value uses monospace font

- **WHEN** a `.pen-stat-block` element with a child `.val` is rendered
- **THEN** the `.val` element has `font-family: var(--font-mono)` and `font-size` between `1.75rem` and `2.5rem`

### Requirement: Section Head Component

The `.pen-section-head` component SHALL produce a centered section header with a horizontal divider, a red triangle marker (`.pen-triangle`, `border-left: 40px solid var(--pen-color-arrow-red)`), and an `h3` heading.

#### Scenario: Section head displays red triangle marker

- **WHEN** a `.pen-section-head` element is rendered containing `.pen-triangle` and an `h3`
- **THEN** the `.pen-triangle` displays as a CSS border triangle with `border-left` color matching `var(--pen-color-arrow-red)` (`#c76a6e`)

### Requirement: Skip Link Accessibility

A `.skip-link` element SHALL be the first focusable child of `<body>`, visually hidden until focused, and linked to the `#main` anchor.

#### Scenario: Skip link becomes visible on focus

- **WHEN** a keyboard user tabs to the skip link
- **THEN** the link appears at `top: var(--space-4); left: var(--space-4)` with a visible border and shadow
