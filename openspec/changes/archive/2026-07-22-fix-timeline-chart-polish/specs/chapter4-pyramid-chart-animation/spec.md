## ADDED Requirements

### Requirement: Pyramid chart bars animate from zero to target width on scroll entry

The 718億先行動支方案 pyramid comparison chart (`.dash-container-box`) SHALL animate its bar elements (`.bar-rect`) from `width: 0` to their target width with a `1s ease-out` CSS transition when the chart first enters the viewport. The animation SHALL be triggered by the IntersectionObserver adding the `.visible-box` class to the chart container.

All inline styles that force `opacity: 1; visibility: visible !important; transform: none !important;` on the chart container elements SHALL be removed so the CSS transition classes can take effect.

The `.bar-rect` elements SHALL start with `width: 0` and transition to their specified width only when the ancestor `.dynamic-chart-box` receives the `.visible-box` class. The transition SHALL use `transition: width 1s ease-out` and the bars SHALL stagger slightly (50ms incremental delay per row via `transition-delay`) so the rows animate sequentially from top to bottom.

#### Scenario: Chart bars animate on first scroll into view

- **WHEN** the pyramid chart scrolls into the viewport for the first time
- **THEN** each `.bar-rect` grows from `width: 0` to its target percentage width over 1 second with ease-out timing
- **AND** the rows animate sequentially with 50ms stagger between each row

#### Scenario: Chart bars remain at target width after animation completes

- **WHEN** the user scrolls past the chart and returns
- **THEN** the bars remain at their target width (the IntersectionObserver does not re-trigger the animation)

##### Example: 5-row pyramid chart animation sequence

| Row | Category | Transition delay | Animation start |
| --- | --- | --- | --- |
| 1 | 地方財政與大眾通勤補貼 | 0ms | Immediate on `.visible-box` |
| 2 | 氣候調適、治水與環保基建 | 50ms | 50ms after `.visible-box` |
| 3 | 醫療與少子化對策 | 100ms | 100ms after `.visible-box` |
| 4 | 戰略科技研發與國防升級 | 150ms | 150ms after `.visible-box` |
| 5 | 其他 | 200ms | 200ms after `.visible-box` |
