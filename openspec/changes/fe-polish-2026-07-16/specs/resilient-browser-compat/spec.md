## ADDED Requirements

### Requirement: matchMedia calls are guarded against unsupported environments

Every call site in `index.html` that invokes `window.matchMedia(...)` SHALL first check that `window.matchMedia` is a function, and SHALL fall back to a defined safe default (motion enabled for the reduced-motion check; the desktop branch for the chapter-3 sync check) when it is not available, instead of throwing.

#### Scenario: matchMedia unavailable in an older embedded WebView

- **WHEN** `index.html` runs in a browser environment where `window.matchMedia` is undefined
- **THEN** the reduced-motion check and the chapter-3 mobile/desktop sync check SHALL each use their defined fallback value and SHALL NOT throw a JavaScript error

### Requirement: Image loading hints reflect visual priority

The hero background image SHALL have a corresponding `<link rel="preload" as="image" fetchpriority="high">` hint in `<head>`. The three below-fold historical photos in `index.html` SHALL each carry `loading="lazy"`.

#### Scenario: Initial page load network prioritization

- **WHEN** `index.html` begins loading
- **THEN** the hero collage image SHALL be requested via the preload hint at high priority, and the three below-fold historical photos SHALL NOT be requested until they approach the viewport
