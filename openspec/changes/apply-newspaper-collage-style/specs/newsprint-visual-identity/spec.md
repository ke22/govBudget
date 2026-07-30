## ADDED Requirements

### Requirement: Newsprint tokens are additive and scoped

The system SHALL define a new set of `--np-*` custom properties (`--np-ink`, `--np-paper`, `--np-paper-panel`, `--np-seal-red`, `--np-seal-red-dark`, `--np-muted`, `--np-hairline`) in `:root`, matching the values validated in the newspaper-collage mockup. The system SHALL NOT rename, remove, or change the value of the existing `--primary`, `--accent`, `--danger`, `--bg-deep`, `--bg-card`, `--text-main`, `--text-muted`, or `--border` tokens.

#### Scenario: New tokens exist alongside the old ones

- **WHEN** the page's `:root` CSS is inspected
- **THEN** all seven `--np-*` tokens listed above are defined
- **AND** `--primary`, `--accent`, `--danger`, `--bg-deep`, `--bg-card`, `--text-main`, `--text-muted`, and `--border` are still defined with their pre-change values

### Requirement: Hero renders as a torn-edge newsprint collage

The hero section (`.hero-section`) SHALL render as a full-bleed collage-style visual with a jagged torn bottom edge, and the "203天" overdue-days statistic SHALL render as a red-bordered circular stamp overlapping that torn edge. The hero headline, subheading, and dek paragraph SHALL use the `--np-ink` and `--np-muted` tokens for text color instead of the prior `--text-main`/`--text-muted`/`--primary` values.

#### Scenario: Hero displays the collage treatment on load

- **WHEN** a reader loads `115MoneyDemoB-main/index.html` and views the hero section
- **THEN** the hero shows a full-bleed collage visual with a torn bottom edge
- **AND** the "203天" stamp overlaps that torn edge
- **AND** the headline, subheading, and dek text render in the `--np-ink`/`--np-muted` newsprint colors

### Requirement: Story cards render as torn paper clippings, consistently across breakpoints

Every `.story-card` instance (all 19, across chapters 1–4) SHALL render with a bottom torn-edge `clip-path`, a slight rotation, a box-shadow, and `--np-paper-panel`/`--np-ink`/`--np-seal-red` coloring — in its default desktop state and in both of its mobile `@media (max-width: 968px)` overrides (chapter 1's mobile layout, and the pinned-band mobile layout shared by chapters 2–3). Neither mobile override SHALL leave a hardcoded `#ffffff` or `rgba(255,255,255,...)` background in place.

#### Scenario: Story card matches across desktop and mobile

- **WHEN** a story card is viewed at a desktop width (≥969px)
- **THEN** it renders with the torn bottom edge, slight rotation, box-shadow, and `--np-paper-panel` background

#### Scenario: Story card stays newsprint-colored and opaque on mobile

- **WHEN** the same story card is viewed at a mobile viewport (390×844) inside chapter 1, and separately inside the chapters 2–3 pinned-band layout
- **THEN** in both cases the card is fully opaque, uses `--np-paper-panel` (not `#ffffff` or any hardcoded white) as its background
- **AND** the card does not visually overlap the pinned Gantt chart band above it

### Requirement: Gantt charts remain visually unchanged

The Gantt chart bars, legend, and active-state borders in chapters 2–3 SHALL render pixel-identical to their appearance before this change, since they depend on the `--primary`/`--accent`/`--danger` tokens which this change does not modify.

#### Scenario: Chart appearance is unaffected

- **WHEN** the Gantt chart sections in chapters 2–3 are viewed before and after this change is applied
- **THEN** their bar colors, legend colors, and active-state border colors are identical
