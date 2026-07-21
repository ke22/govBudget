## ADDED Requirements

### Requirement: Chapter 3 intro reveal is gated on Chapter 2's exit completion

Chapter 3's introductory text (`.chapter-intro`) SHALL reveal via an explicit transition gated on the `history-exit-complete` state — the same state Chapter 2's history-visual exit fade already sets once its exit progress reaches 1 — instead of relying on the incidental timing of Chapter 2's fixed stage losing its own active state.

#### Scenario: Intro reveals once the exit fade completes

- **WHEN** Chapter 2's history-visual exit fade reaches its complete state (`history-exit-complete`)
- **THEN** Chapter 3's intro text begins its reveal transition

#### Scenario: Intro is not revealed before the exit fade completes

- **WHEN** Chapter 2's history-visual exit fade has not yet reached its complete state
- **THEN** Chapter 3's intro text remains in its pre-reveal state

#### Scenario: Reduced motion and no-JavaScript show the intro immediately

- **WHEN** `prefers-reduced-motion: reduce` is enabled, or JavaScript is unavailable
- **THEN** Chapter 3's intro text is immediately visible without waiting for the `history-exit-complete` state or any reveal transition
