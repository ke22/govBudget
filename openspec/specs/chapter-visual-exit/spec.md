# chapter-visual-exit Specification

## Purpose

Scroll-linked retirement of the Chapter 2 fixed history visual before Chapter 3 becomes readable, so the two chapters' visuals never occupy the same readable viewport space.

## Requirements

### Requirement: Chapter 2 history visual exits with the final story card

The report SHALL derive Chapter 2 exit progress from the top edge of the visible `.story-card` inside `data-rebuilt-step="9"`. The history visual SHALL be fully visible when that edge is at or below 55% of viewport height, SHALL fade linearly while the edge moves from 55% to 35%, and SHALL be transparent and hidden when the edge is at or above 35%.

#### Scenario: Final card drives continuous fade

- **WHEN** the final story card top moves upward through the 55vh to 35vh interval
- **THEN** Chapter 2 history-visual opacity moves continuously from 1 to 0
- **AND** the visual does not intercept pointer events after exit progress reaches 1

##### Example: Exit progress boundaries

| Final story card top | Exit progress | History opacity | Visibility state |
| --- | --- | --- | --- |
| 60vh | 0 | 1 | visible |
| 55vh | 0 | 1 | visible |
| 45vh | 0.5 | 0.5 | visible |
| 35vh | 1 | 0 | hidden |
| 25vh | 1 | 0 | hidden |

### Requirement: Chapter 2 visual cannot cover Chapter 3

The report SHALL force the Chapter 2 fixed visual into its hidden exit state no later than the moment the top of Chapter 3 reaches the viewport bottom. Chapter 3 headings and introductory copy MUST NOT share readable viewport space with an opaque Chapter 2 fixed visual.

#### Scenario: Large forward scroll jump skips fade interval

- **WHEN** a forward scroll jump moves Chapter 3 into the viewport without sampling every point in the final-card fade interval
- **THEN** the Chapter 2 fixed visual is immediately transparent, hidden, and excluded from hit testing
- **AND** the Chapter 3 heading remains unobstructed

### Requirement: Exit state is reversible and motion-aware

The report SHALL recompute exit state from current geometry on reverse scrolling. Under `prefers-reduced-motion: reduce`, it SHALL switch from visible to hidden when the final story card top crosses 45% of viewport height and MUST NOT animate opacity between states.

#### Scenario: Reader reverses into Chapter 2

- **WHEN** the reader scrolls upward from Chapter 3 and the final Chapter 2 story card moves below the exit thresholds
- **THEN** the history visual returns to the opacity and visibility state implied by the card's current position
- **AND** no stale forward-scroll state prevents restoration

#### Scenario: Reduced-motion exit

- **WHEN** reduced motion is enabled and the final story card crosses upward through 45vh
- **THEN** the Chapter 2 history visual switches to transparent and hidden without an opacity transition
