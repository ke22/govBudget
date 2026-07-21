# responsive-storytelling-motion Specification

## Purpose

Three-band layout and motion complexity, scene-derived scroll runways, and directly readable reduced-motion/no-JavaScript states, so the report's scrollytelling degrades gracefully across viewport sizes and accessibility settings instead of relying on one fixed-height desktop composition everywhere.

## Requirements

### Requirement: Storytelling layout and motion use three tiers

The report SHALL use compact layout and motion through 640 CSS pixels, intermediate layout and motion from 641 through 1024 CSS pixels, and wide layout and motion from 1025 CSS pixels. All tiers SHALL preserve the same semantic content order and core editorial story.

#### Scenario: Compact storytelling uses normal flow

- **WHEN** the report is rendered at 640 CSS pixels or below
- **THEN** story cards and required labels participate in normal document flow
- **AND** long-lived sticky regions, large displacement transforms, and reveal states that gate readability are disabled

#### Scenario: Intermediate storytelling simplifies motion

- **WHEN** the report is rendered from 641 through 1024 CSS pixels
- **THEN** each chapter uses a single-column or simplified text-and-visual composition
- **AND** core chart-state changes remain available without wide-layout sticky duration or large displacement transforms

#### Scenario: Wide storytelling retains full interaction

- **WHEN** the report is rendered at 1025 CSS pixels or above
- **THEN** Chapter 1 retains its alternating timeline reveal
- **AND** Chapter 2 and Chapter 3 retain their complete sticky chart and scrollytelling sequences

### Requirement: CSS owns layout and JavaScript owns state

CSS SHALL own primary ordering, width, height constraints, grid or flex composition, sticky boundaries, and normal-flow fallbacks. JavaScript SHALL expose interaction state through semantic classes or bounded CSS custom properties and MUST NOT be the sole source of readable element geometry.

#### Scenario: JavaScript updates a scene

- **WHEN** scrolling changes the active scene
- **THEN** JavaScript updates an active-step class or bounded progress variable
- **AND** CSS resolves the corresponding visual state without JavaScript assigning primary content width or document-flow position

### Requirement: Scroll runways derive from authored scenes

Chapter 2 and Chapter 3 scroll runway length SHALL derive from authored scene count and documented reading intervals. Compact layouts SHALL use content-driven normal flow. Intermediate layouts SHALL use shorter state intervals than the wide layout. A chapter MUST NOT depend on a fixed global `vh` height that is unrelated to its scene count or copy length.

#### Scenario: Scene count changes

- **WHEN** an authored story scene is added or removed
- **THEN** the chapter runway updates from its scene-count contract
- **AND** implementation does not require replacing an unrelated fixed height such as `850vh`

### Requirement: Reduced-motion and no-JavaScript states are directly readable

Under `prefers-reduced-motion: reduce`, required content SHALL render without parallax-like displacement, interpolated reveal transforms, or long animated sticky exits. When JavaScript is unavailable, all required editorial cards and labels SHALL remain visible in semantic document order, and fixed stages MUST NOT cover later chapters.

#### Scenario: Reduced motion is enabled

- **WHEN** the operating system requests reduced motion
- **THEN** required cards and labels are immediately readable without a reveal animation
- **AND** essential chart-state changes use immediate threshold switches

#### Scenario: JavaScript is unavailable

- **WHEN** the report loads without executing JavaScript
- **THEN** all required editorial cards and labels remain visible in document order
- **AND** no fixed visual stage remains above a later chapter
