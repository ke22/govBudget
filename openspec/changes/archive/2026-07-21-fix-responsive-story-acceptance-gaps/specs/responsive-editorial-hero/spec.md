## ADDED Requirements

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
