## MODIFIED Requirements

### Requirement: Hero scroll indicator stays fully visible on phone

On phone widths (viewport <= 640px), the hero「向下捲動探索」scroll indicator (`.scroll-indicator`, its label and its downward `::after` line) SHALL remain fully within the hero's visible area throughout its bounce animation, never clipped by the hero section's torn `clip-path` bottom edge. The indicator SHALL NOT be hidden on phone.

The implementation SHALL use a dedicated `@keyframes bounce-mobile` animation with dampened bounce heights (`-6px` at 40% keyframe, `-3px` at 60% keyframe) instead of the desktop `@keyframes bounce` (which uses `-10px`). The mobile override SHALL set `bottom: 90px` (up from 40px) and `.scroll-indicator::after { height: 26px; }` (down from 40px) to keep the indicator above the hero's torn clip-path bottom edge.

The indicator label "向下捲動探索" SHALL be horizontally centered in the hero section via `left: 50%; transform: translateX(-50%)` at all viewport widths.

#### Scenario: Indicator not clipped during bounce on mobile

- **WHEN** the hero is viewed on a phone-width viewport (<= 640px) and the `.scroll-indicator` bounce animation runs
- **THEN** the full label text and the entire downward line remain visible (not cut off by the hero's clipped bottom) at every point of the bounce cycle
- **AND** the indicator uses `@keyframes bounce-mobile` with maximum vertical displacement of `-6px` (not `-10px`)

#### Scenario: Indicator horizontally centered on all viewports

- **WHEN** the hero section is viewed at any viewport width
- **THEN** the "向下捲動探索" text is horizontally centered relative to the hero section

#### Scenario: Desktop indicator unchanged

- **WHEN** the hero is viewed at desktop width (>= 969px)
- **THEN** the scroll indicator keeps its original bottom offset (40px) and bounce amplitude (`@keyframes bounce`)
