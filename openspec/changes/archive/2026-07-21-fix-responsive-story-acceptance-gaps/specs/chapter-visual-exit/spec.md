## ADDED Requirements

### Requirement: Final history image completes before the final story card enters

The report SHALL sequence the Chapter 2 step-9 transition so the third (final) history image reaches full opacity before the step-9 story card's entrance transition begins, instead of both being driven by the same simultaneous scroll-step class toggle.

#### Scenario: Image finishes before card enters

- **WHEN** forward scrolling reaches the Chapter-2 step-9 threshold at desktop width
- **THEN** the third history image completes its own fade-in to full opacity
- **AND** only then does the step-9 story card's entrance transition begin

## MODIFIED Requirements

### Requirement: Exit state is reversible and motion-aware

The report SHALL recompute exit state from current geometry on reverse scrolling. Under `prefers-reduced-motion: reduce`, it SHALL switch from visible to hidden when the final story card top crosses 45% of viewport height and MUST NOT animate opacity between states. The same exit/re-entry guard SHALL apply to the step-9 story card element itself, not only the fixed history-image backdrop, so neither can be left visually overlapping Chapter 3 content in either scroll direction.

#### Scenario: Reader reverses into Chapter 2

- **WHEN** the reader scrolls upward from Chapter 3 and the final Chapter 2 story card moves below the exit thresholds
- **THEN** the history visual returns to the opacity and visibility state implied by the card's current position
- **AND** no stale forward-scroll state prevents restoration

#### Scenario: Reduced-motion exit

- **WHEN** reduced motion is enabled and the final story card crosses upward through 45vh
- **THEN** the Chapter 2 history visual switches to transparent and hidden without an opacity transition

#### Scenario: Text story-card is covered by the same exit guard as the image backdrop

- **WHEN** scrolling forward or backward through the Chapter 2 → Chapter 3 boundary at 390 x 844, 768 x 1024, or 1366 x 768 CSS pixels
- **THEN** neither the step-9 story card nor the history-image backdrop is ever visibly overlapping Chapter 3 heading or chart content, in either scroll direction
