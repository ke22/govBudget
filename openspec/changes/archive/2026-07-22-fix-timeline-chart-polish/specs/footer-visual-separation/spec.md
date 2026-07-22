## ADDED Requirements

### Requirement: Footer is visually distinct from the content section above

The `<footer>` element SHALL use a background color that is visually distinguishable from the `.footer-cta` section immediately above it. The footer background SHALL differ from `--bg-deep` (`#12191A`) by at least a noticeable tonal shift, creating a clear visual boundary without requiring the reader to locate the copyright text.

The footer SHALL use a warmer dark tone (e.g., `#1E1410` or similar warm-charcoal) or a top border (1px solid with 10-15% opacity separator) to mark the transition from editorial content to site metadata.

#### Scenario: Footer background differs from content above

- **WHEN** the page is scrolled to the bottom
- **THEN** the footer area is visually distinguishable from the `.footer-cta` section above it via a noticeable background color or border difference

#### Scenario: Footer maintains design cohesion

- **WHEN** the footer is viewed alongside the rest of the page
- **THEN** the footer's background color remains within the overall dark editorial color palette (no bright or jarring colors) while still being perceptibly different from the content above
