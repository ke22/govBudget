## ADDED Requirements

### Requirement: Primary red achieves readable contrast on dark backgrounds

All instances where `--primary` (`#A5271E`) is used as a foreground color or significant decorative element on dark backgrounds (`--bg-deep`, `--bg-chart`, or darker) SHALL achieve a contrast ratio of at least 4.5:1 against their immediate background. Where `--primary` fails this threshold, the usage SHALL be replaced with `--np-seal-red-bright` (`#E2564A`) or the `--primary` variable value itself SHALL be updated.

The mobile Chapter 1 timeline vertical line gradient (`#chapter-1 .local-scroll-content::before`) currently uses `var(--primary)` as the start color. This SHALL be updated to use `--np-seal-red-bright` or a color that provides sufficient contrast against the adjacent content.

The CTA button (`.cta-btn`) uses `--primary` as its `background-color` with white text. This combination achieves adequate contrast (white on dark red), so it SHALL NOT be changed.

#### Scenario: Dark-background red text meets contrast threshold

- **WHEN** any text or decorative element uses a red color variable on a dark background
- **THEN** the contrast ratio between the red color and its background is at least 4.5:1

#### Scenario: CTA button retains existing style

- **WHEN** the CTA button (`.cta-btn`) is rendered
- **THEN** its background remains `--primary` with white text (no change needed)

### Requirement: Mobile red timeline line animates on scroll

On viewports <= 640px, the Chapter 1 timeline red line (`.center-main-line-fill`) SHALL animate its height based on scroll progress, matching the desktop behavior. The mobile CSS SHALL NOT force `height: 100% !important` on `.center-main-line-fill`. Instead, the JavaScript `updateTimelineMainLineFill()` function SHALL drive the fill height on mobile identically to desktop.

#### Scenario: Mobile red line tracks scroll progress

- **WHEN** the Chapter 1 timeline is viewed on a viewport <= 640px
- **THEN** the red line fill grows from 0% to 100% based on the user's scroll position through the timeline container, matching the desktop scroll-driven behavior

#### Scenario: Mobile red line starts at zero

- **WHEN** the page first loads on a mobile viewport
- **THEN** the Chapter 1 red line fill height is 0% (not pre-filled to 100%)
