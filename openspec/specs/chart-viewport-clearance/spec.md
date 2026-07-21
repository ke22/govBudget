# chart-viewport-clearance Specification

## Purpose

Header-aware chart placement and short-viewport clearance across the report's Chapter 2, Chapter 3, and Chapter 4 chart stages, so chart content never sits behind the fixed header or overflows short viewports.

## Requirements

### Requirement: Chart stages share header-aware top clearance

Every Chapter 2, Chapter 3, and Chapter 4 chart stage SHALL position its complete panel below a shared top clearance equal to the fixed site-header height, the top safe-area inset, and a 24 CSS pixel visual gap. A sticky visual stage SHALL cap its outer height to the small viewport space remaining after the header is subtracted exactly once. The clearance SHALL move the complete chart panel without changing internal axis, plot, legend, or label alignment.

#### Scenario: Chart content clears fixed header

- **WHEN** any report chart is visible at a supported matrix viewport
- **THEN** the topmost visible chart title, label, legend, or plot pixel is at least 24 CSS pixels below the fixed header bottom after safe-area inset is applied
- **AND** internal axes and data marks retain their alignment

#### Scenario: Sticky stage uses the remaining viewport

- **WHEN** a Chapter 2 or Chapter 3 sticky visual stage is rendered at a supported viewport
- **THEN** its outer height does not exceed `100svh` minus the shared fixed-header height
- **AND** internal top clearance does not subtract the header a second time

### Requirement: Short wide viewports receive additional clearance

At widths of 1025 CSS pixels or more and heights of 900 CSS pixels or less, chart stages SHALL add 16 CSS pixels of short-laptop top clearance. Chapter 2's `96年度` Y-axis label MUST remain fully visible below the fixed header.

#### Scenario: 1366 by 768 laptop clearance

- **WHEN** the Chapter 2 chart is rendered at 1366 x 768 CSS pixels
- **THEN** the top edge of the visible `96年度` label is at least 24 CSS pixels below the fixed header bottom
- **AND** the label is not clipped by the chart panel

### Requirement: Chart panels fit remaining viewport height

Each chart panel SHALL cap its height to the viewport space remaining after top clearance and a 24 CSS pixel bottom gap. Moving the panel down MUST NOT push its bottom axis, labels, legend, or controls outside the viewport.

#### Scenario: Short laptop retains complete chart bounds

- **WHEN** a Chapter 2, Chapter 3, or Chapter 4 chart is rendered at 1366 x 768 CSS pixels
- **THEN** both the topmost and bottommost chart content remain inside the visible viewport
- **AND** no vertical scrollbar is introduced inside the chart panel solely by the clearance adjustment

#### Scenario: Phone chart band retains complete chart bounds

- **WHEN** a pinned chart band is rendered at 390 x 844 CSS pixels
- **THEN** its complete panel fits beneath the fixed header within the band
- **AND** its story-card reading zone remains available below the band
