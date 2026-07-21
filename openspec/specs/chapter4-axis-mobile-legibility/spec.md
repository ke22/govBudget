# chapter4-axis-mobile-legibility Specification

## Purpose

The Chapter-4 comparison chart's numeric axis stays legible and aligned with its bars on phone, instead of crowding five three-digit numbers into a narrow column.

## Requirements

### Requirement: Chapter-4 numeric axis is legible and aligned on phone

On phone widths, the Chapter-4 comparison axis (`.p-scale-axis-linear`) SHALL use the same grid template as the bar rows (`1fr 72px 1fr`, gap 6px) so its ticks align with the bars, and SHALL show only 3 numeric ticks per side (0 / 200 / 400) at a font size small enough that the numbers do not overlap.

#### Scenario: Axis numbers do not collide on phone

- **WHEN** the Chapter-4 chart is viewed at phone width
- **THEN** each side of the axis shows exactly 0, 200, 400 with no overlapping numbers, and the ticks line up horizontally with the bar columns above them

#### Scenario: Desktop axis keeps five ticks

- **WHEN** the Chapter-4 chart is viewed at desktop width (>= 969px)
- **THEN** the axis still shows all five ticks (0/100/200/300/400) with the original grid
