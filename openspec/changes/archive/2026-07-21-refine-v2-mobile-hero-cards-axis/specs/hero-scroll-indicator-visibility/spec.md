## ADDED Requirements

### Requirement: Hero scroll indicator stays fully visible on phone

On phone widths, the hero「向下捲動探索」scroll indicator (`.scroll-indicator`, its label and its downward `::after` line) SHALL remain fully within the hero's visible area throughout its bounce animation, never clipped by the hero section's torn `clip-path` bottom edge. The indicator SHALL NOT be hidden on phone.

#### Scenario: Indicator not clipped during bounce

- **WHEN** the hero is viewed on a phone-width viewport and the `.scroll-indicator` bounce animation runs
- **THEN** the full label text and the entire downward line remain visible (not cut off by the hero's clipped bottom) at every point of the bounce cycle

#### Scenario: Desktop indicator unchanged

- **WHEN** the hero is viewed at desktop width (>= 969px)
- **THEN** the scroll indicator keeps its original bottom offset and bounce amplitude
