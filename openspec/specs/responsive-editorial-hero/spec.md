# responsive-editorial-hero Specification

## Purpose

Responsive hero composition, semantic live text, and device-size framing requirements, so the compact and intermediate hero renders required editorial content as live, collision-free HTML rather than baking it into a decorative image.

## Requirements

### Requirement: Compact and intermediate heroes use live editorial content

At layout widths up to 1024 CSS pixels, the report SHALL render its title, subtitle, overdue stamp, dek, and scroll affordance as live HTML content. The decorative collage SHALL NOT contain information required to understand the report, and the visible report title SHALL be the semantic level-one heading.

#### Scenario: Compact hero content remains readable

- **WHEN** the report is rendered at 390 x 844 or 430 x 932 CSS pixels
- **THEN** the complete title, subtitle, overdue stamp, dek, and scroll affordance are visible without overlap, clipping, or horizontal overflow
- **AND** no required title text depends on the decorative image

#### Scenario: Intermediate hero content remains readable

- **WHEN** the report is rendered at 768 x 1024, 820 x 1180, or 1024 x 768 CSS pixels
- **THEN** the complete live editorial content remains visible without overlap, clipping, or horizontal overflow
- **AND** the same semantic content order is preserved across all three viewports

#### Scenario: Decorative image fails to load

- **WHEN** the clean mobile and tablet collage cannot be loaded
- **THEN** the deep canvas fallback remains visible
- **AND** the title, subtitle, overdue stamp, dek, and scroll affordance remain readable

### Requirement: Hero layout uses content-driven height

The compact and intermediate hero SHALL use normal layout for editorial content, SHALL provide a minimum height equal to the small viewport height remaining below the fixed header, and SHALL grow beyond that height when its content requires additional space. The fixed header height MUST be compensated exactly once. Required text elements MUST NOT depend on fixed top or bottom coordinates to avoid each other.

#### Scenario: Short compact viewport contains long dek copy

- **WHEN** the compact hero is rendered at 390 x 844 CSS pixels with the current full dek copy
- **THEN** the hero grows enough to preserve the required spacing between title, artwork, stamp, dek, and scroll affordance
- **AND** no content is removed or placed behind another element

#### Scenario: Header height is subtracted once

- **WHEN** the compact or intermediate hero is rendered beneath the fixed site header
- **THEN** its minimum presentation height equals `100svh` minus the shared header height
- **AND** neither body spacing nor hero internal padding adds a second header-height offset

### Requirement: Responsive composition uses three layout bands

The report SHALL use compact layout through 640 CSS pixels, intermediate layout from 641 through 1024 CSS pixels, and wide layout from 1025 CSS pixels. Compact and intermediate layouts SHALL share one clean hero asset and semantic structure; the wide layout SHALL preserve the existing desktop hero composition.

#### Scenario: Layout band boundaries are deterministic

- **WHEN** viewport width changes across 640, 641, 1024, and 1025 CSS pixels
- **THEN** exactly one of the compact, intermediate, or wide hero layouts applies at each width
- **AND** no device or user-agent detection is required

#### Scenario: Shared intermediate composition satisfies tablet framing

- **WHEN** the hero is inspected at both 768 x 1024 and 820 x 1180 CSS pixels
- **THEN** required collage subjects remain framed and live editorial content remains collision-free using the shared intermediate composition
- **AND** no separate tablet markup is rendered

### Requirement: Fixed utility controls do not cover hero content

At compact and intermediate widths, fixed utility controls SHALL remain geometrically disjoint from the live title, subtitle, overdue stamp, dek, and scroll affordance. The back-to-hero control SHALL remain hidden while the hero is the active section and SHALL become available only after the reader leaves the hero.

#### Scenario: Back-to-hero control at compact page start

- **WHEN** the report is rendered at 390 x 844 CSS pixels with scroll position zero
- **THEN** the back-to-hero control is not visible or hit-testable
- **AND** the complete dek remains unobstructed

#### Scenario: Back-to-hero control after leaving hero

- **WHEN** the reader scrolls beyond the hero section
- **THEN** the back-to-hero control becomes visible and keyboard accessible
- **AND** it does not cover the active chapter's primary reading column

### Requirement: Overdue stamp position is computed relative to rendered title bounds

At compact and intermediate widths, the overdue-stamp wrapper's position SHALL be computed from the rendered geometry of the hero title (or SHALL reserve a fixed clearance margin sized to the stamp's worst-case rendered footprint), so the stamp and the title's rendered text can never occupy the same pixels regardless of title line count, viewport width, or subsequent styling edits made independently to either element.

#### Scenario: Stamp and title never intersect across the supported width matrix

- **WHEN** the hero is rendered at 390 x 844, 430 x 932, 768 x 1024, 820 x 1180, or 1024 x 768 CSS pixels with the current title and subtitle copy
- **THEN** the overdue stamp's rendered bounding box and the hero title's rendered bounding box do not intersect

#### Scenario: A narrower phone width is also collision-free

- **WHEN** the hero is rendered at 320 x 568 CSS pixels with the current title and subtitle copy
- **THEN** the overdue stamp's rendered bounding box and the hero title's rendered bounding box do not intersect

#### Scenario: Independent edits to either element cannot silently reintroduce overlap

- **WHEN** either the stamp's position/size or the title's font size, line count, or copy changes
- **THEN** the collision-avoidance mechanism recomputes from the other element's current rendered bounds rather than relying on two independently-authored fixed coordinates staying compatible by coincidence

##### Example: title copy grows from one line to two

| Change | Before | After |
| --- | --- | --- |
| Title copy forces a second line at 390px width | Reserved clearance sized for a 1-line title | Reserved clearance recomputed for the taller 2-line title; stamp and title still do not intersect |
| Stamp repositioned closer to the panel edge in a later edit | Clearance margin matched the old stamp position | Clearance margin recomputed from the stamp's new worst-case footprint; no manual re-sync of two independent values required |
