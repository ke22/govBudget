## ADDED Requirements

### Requirement: Visual output is pixel-identical after optimization

The scrollytelling page (index.html) SHALL render output that is visually indistinguishable before and after the performance optimizations. Colors, typography, layout, spacing, copy, and every animation's start and end state MUST remain unchanged.

#### Scenario: Static appearance is unchanged

- **WHEN** the optimized page is rendered at any given scroll position at a fixed viewport width
- **THEN** it matches a screenshot of the pre-optimization page at the same scroll position and width with no perceptible difference

#### Scenario: Animation endpoints are unchanged

- **WHEN** a scroll-driven animation (timeline progress, Gantt bars, ratio/donut switch, ranking reveal) reaches its start or completion state
- **THEN** the element's final visual position, size, and color match the pre-optimization behavior

### Requirement: Scroll handlers run passively and are frame-throttled

Scroll event handling on the page SHALL avoid blocking the compositor and SHALL avoid running layout-reading and DOM-writing work more than once per animation frame.

#### Scenario: Passive scroll listeners

- **WHEN** a scroll listener is registered on `window`
- **THEN** it is registered with `{ passive: true }` so it does not block scrolling

#### Scenario: Frame-throttled scroll work

- **WHEN** scroll events fire faster than the display refresh rate
- **THEN** the associated layout reads (`getBoundingClientRect`) and DOM writes execute at most once per frame via a `requestAnimationFrame`-guarded callback, reading layout before writing to avoid layout thrash

### Requirement: Bar animations preserve rounded-corner fidelity

Bar and progress-bar growth animations SHALL preserve the exact rendered appearance of their rounded corners. Because every animated bar in the page carries a non-zero `border-radius` (chapter-2 `.gantt-bar-rebuilt`, chapter-3 `.ch3-single-bar-layer`, and the chapter-1 `#timeline-progress-bar`), and because these bars animate only on discrete step transitions rather than every scroll frame, they SHALL retain their `width`/`height`-based animation. They SHALL NOT be converted to `transform: scaleX()`/`scaleY()`, which would horizontally or vertically distort the `border-radius` and change the rendered look.

#### Scenario: Rounded corners are unchanged during and after bar growth

- **WHEN** any animated bar grows to its target extent as the reader scrolls into its step
- **THEN** its `border-radius` corners render identically to the pre-optimization page, with no horizontal or vertical squishing

#### Scenario: No layout thrash is introduced by retaining width/height

- **WHEN** the reader scrolls within a step where a bar has already reached its target size
- **THEN** re-applying the same `width`/`height` value performs no repeated layout, because the value is unchanged and the growth transition fires only once on step entry

### Requirement: Fixed and sticky stages use dynamic viewport height

Full-height fixed or sticky "stage" sections SHALL size to the dynamic viewport so that showing or hiding the mobile browser chrome does not cause visible jumps.

#### Scenario: Mobile address-bar resize does not jump the stage

- **WHEN** the page is viewed on a mobile browser whose address bar collapses or expands during scroll
- **THEN** the fixed/sticky stage height is expressed with `100dvh` (with a `100vh` fallback for unsupported browsers) and does not visibly resize or jump

### Requirement: Reduced-motion preference is honored

The page SHALL respect the user's reduced-motion preference without changing final visual states.

#### Scenario: Reduced motion shortens non-essential transitions

- **WHEN** the user's system sets `prefers-reduced-motion: reduce`
- **THEN** a `@media (prefers-reduced-motion: reduce)` block shortens or disables non-essential transitions while every element's final rendered state remains identical to the default experience
