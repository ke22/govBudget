## MODIFIED Requirements

### Requirement: Storytelling layout and motion use three tiers

The report SHALL use compact layout and motion through 640 CSS pixels, intermediate layout and motion from 641 through 1024 CSS pixels, and wide layout and motion from 1025 CSS pixels. All tiers SHALL preserve the same semantic content order and core editorial story. Chapter 1's alternating timeline reveal (progressive card reveal synced to the growing line, the line-lead offset, and the terminal marker) SHALL be active at both intermediate and wide widths — it is the one exception to intermediate width's general motion simplification.

#### Scenario: Compact storytelling uses normal flow

- **WHEN** the report is rendered at 640 CSS pixels or below
- **THEN** story cards and required labels participate in normal document flow
- **AND** long-lived sticky regions, large displacement transforms, and reveal states that gate readability are disabled

#### Scenario: Intermediate storytelling simplifies motion, except Chapter 1's timeline

- **WHEN** the report is rendered from 641 through 1024 CSS pixels
- **THEN** Chapter 2 and Chapter 3 use a single-column or simplified text-and-visual composition
- **AND** core chart-state changes remain available without wide-layout sticky duration or large displacement transforms
- **AND** Chapter 1 retains its progressive alternating timeline reveal (line-lead card trigger and terminal marker), not the simplified single-column treatment

#### Scenario: Wide storytelling retains full interaction

- **WHEN** the report is rendered at 1025 CSS pixels or above
- **THEN** Chapter 1 retains its alternating timeline reveal
- **AND** Chapter 2 and Chapter 3 retain their complete sticky chart and scrollytelling sequences
