## ADDED Requirements

### Requirement: Chart frame geometry resizes consistently at every breakpoint

Any chart that uses a shared absolutely-positioned frame (matching `left`/`right`/`bottom` coordinates across its rows container, grid, axes, and deadline/threshold overlays) SHALL resize every one of those frame elements identically at each breakpoint that changes the chart stage's available width, so percentage-based content inside the frame (bars, axis ticks, threshold lines) stays aligned and contained. A breakpoint MUST NOT resize only a subset of the frame's elements (or only the surrounding card/wrapper) while leaving the frame's own coordinates at a wider breakpoint's values.

#### Scenario: Intermediate width keeps the Chapter-2 Gantt contained

- **WHEN** the Chapter-2 Gantt chart is rendered at 768 x 1024 or 1024 x 768 CSS pixels
- **THEN** every bar remains fully inside the chart panel's bounds
- **AND** no X-axis or Y-axis tick or label renders outside the chart panel

#### Scenario: Adding an intermediate override does not require touching every element by hand

- **WHEN** a breakpoint's frame override is authored
- **THEN** it targets the complete set of frame elements that share the coordinate system (rows container, grid, axes, threshold/deadline overlays) rather than a partial subset

##### Example: 641-1024px override touches the full frame set

| Selector | Coordinate system | Overridden at 641-1024px |
| --- | --- | --- |
| `.gantt-rows-container-rebuilt` | shares `left`/`right`/`bottom` frame | Yes |
| `.gantt-grid-rebuilt` | shares `left`/`right`/`bottom` frame | Yes |
| `.gantt-x-axis-rebuilt` | shares `left`/`right`/`bottom` frame | Yes |
| `.gantt-red-deadline-stage` | shares `left`/`right`/`bottom` frame, positioned as a percentage inside it | Yes |
| `.gantt-card-rebuilt` (surrounding card, not part of the shared frame) | independent min-height only | Already overridden separately — not part of this requirement |
