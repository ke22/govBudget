## ADDED Requirements

### Requirement: Desktop scroll indicator uses a dark-background-safe text color

At desktop width (`≥1025px`), the hero's `.scroll-indicator` label and its downward `::after` line SHALL use a color authored for legibility against a dark background, not a color authored for light-card contexts.

#### Scenario: Scroll indicator is legible against the dark hero collage

- **WHEN** the hero is rendered at 1366 x 768 CSS pixels or wider
- **THEN** the scroll indicator's label and line render in `--ui-ink-inverse`
- **AND** neither uses `--ui-muted`

### Requirement: Page footer is visually distinguished from the section above it

`.page-footer` SHALL render a visible boundary separating it from the section immediately preceding it in the document, even when both share the same or a visually identical background color.

#### Scenario: Footer shows a visible seam from the CTA section above it

- **WHEN** the report's footer is rendered at any supported viewport
- **THEN** a visible border or equivalent boundary separates `.page-footer` from `.footer-cta`'s background

### Requirement: Compact and intermediate hero stamp is enlarged while remaining collision-free with the title

At `≤1024px` widths, the overdue-stamp's rendered footprint SHALL be larger than its previous footprint, and the clearance margin reserved on the hero title (per the existing `responsive-editorial-hero` collision-avoidance requirement) SHALL be recomputed to match the new, larger footprint so the stamp and title's rendered bounding boxes still do not intersect.

#### Scenario: Enlarged stamp remains collision-free across the supported width matrix

- **WHEN** the hero is rendered at 320 x 568, 390 x 844, 430 x 932, 768 x 1024, 820 x 1180, or 1024 x 768 CSS pixels with the current title and subtitle copy
- **THEN** the enlarged overdue stamp's rendered bounding box and the hero title's rendered bounding box do not intersect

##### Example: recomputed margin at the new scale

| Value | Previous (`fix-responsive-story-acceptance-gaps`) | New (this change) |
| --- | --- | --- |
| `.hero-stamp-wrap` scale | `0.72` | `0.9` |
| Rendered arrow-tip bottom (panel-relative) | `56.32px` | `66.4px` |
| `.hero-title` `margin-top` | `34px` | `44px` |
| Buffer below arrow tip | `~7.68px` | `~7.6px` |
