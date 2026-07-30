## ADDED Requirements

### Requirement: Display and body text use named typography tokens

The system SHALL define `--font-display` (serif: `'Noto Serif TC', 'Songti TC', 'PMingLiU', serif`) and `--font-body` (sans: `'Noto Sans TC', sans-serif`) as CSS custom properties in `:root`. All `h1` and `h2` elements SHALL reference `--font-display` for `font-family`, and `body` SHALL reference `--font-body` for `font-family`. Neither rule SHALL repeat the literal font stack outside the token definition.

#### Scenario: Headings and body text render from tokens, not literals

- **WHEN** the page's `:root`, `h1, h2`, and `body` CSS rules are inspected
- **THEN** `--font-display` and `--font-body` are both defined with their documented font stacks
- **AND** the `h1, h2` rule's `font-family` value is `var(--font-display)`
- **AND** the `body` rule's `font-family` value is `var(--font-body)`
