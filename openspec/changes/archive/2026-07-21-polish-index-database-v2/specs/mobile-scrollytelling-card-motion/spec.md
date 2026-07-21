## ADDED Requirements

### Requirement: Mobile Chapter-2/3 story cards slide bottom-to-top instead of fading in place

On `index-v2.html` at mobile widths (`max-width: 968px`), the active story card in Chapter 2 and Chapter 3's pinned scrollytelling stages SHALL transition using a translate-based slide (incoming from below, outgoing toward the top), matching the direction of travel that desktop's normal-scroll-flow cards already exhibit, instead of the current in-place opacity/visibility fade.

#### Scenario: Advancing a step slides the new card up from below

- **WHEN** the active step changes from step N to step N+1 during a mobile scroll
- **THEN** step N's card translates upward while fading out, and step N+1's card translates in from below the viewport while fading in, ending at its normal centered resting position

#### Scenario: The final step-9 card exits with the same slide, not an instant disappearance

- **WHEN** the user scrolls past Chapter 2's step 9 (the last history-photo step) on mobile
- **THEN** the step-9 card slides upward and off the top of the viewport using the same transition as every other step, rather than disappearing abruptly together with its photo

#### Scenario: Only one card is interactive/visible at a time

- **WHEN** any step's card is in its "outgoing" or fully-hidden state
- **THEN** that card SHALL NOT intercept pointer events or be exposed to assistive technology as visible, consistent with the current step-exclusivity behavior (only the active step's card is interactive)

#### Scenario: The pinned chart and the active card never overlap during the transition

- **WHEN** a card is mid-transition (partially translated in or out)
- **THEN** it SHALL remain within the existing lower reading-zone boundary established by the mobile pinned-band layout, and SHALL NOT visually overlap the pinned chart band at any point in the transition
