## ADDED Requirements

### Requirement: Vertical distribution of content within cleared chart space is a presentation choice

Within a chart stage's already-enforced top and bottom clearance, the vertical alignment of the chart panel's content (e.g. centered vs. top-anchored) SHALL be a presentation choice not constrained by this specification's clearance requirements, provided the enforced top and bottom clearance minimums remain intact regardless of the chosen alignment.

#### Scenario: Centering content within the cleared band remains compliant

- **WHEN** a chart stage's content is vertically centered within its already-clearance-padded content box instead of top-anchored
- **THEN** the topmost visible chart content is still at least the required clearance below the fixed header
- **AND** the bottommost visible chart content still remains inside the viewport

##### Example: Chapter 3 sticky box at 1366x768

| Alignment | Top clearance (padding-enforced) | Bottom clearance (padding-enforced) | Compliant? |
| --- | --- | --- | --- |
| `flex-start` (top-anchored) | Unchanged, from padding | Unchanged, from padding | Yes |
| `center` | Unchanged, from padding (alignment only redistributes slack beyond the padding) | Unchanged, from padding | Yes |
