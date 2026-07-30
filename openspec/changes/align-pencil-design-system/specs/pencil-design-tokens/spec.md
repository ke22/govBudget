## ADDED Requirements

### Requirement: Token Namespace

All CSS custom properties for the pencil design system SHALL use the `--pen-color-*`, `--pen-*`, `--pencil-*`, `--space-*`, `--ease-*`, or `--shadow-*` prefix. No `--color-*` tokens SHALL exist in `index.css`.

#### Scenario: Token naming is consistent

- **WHEN** a developer inspects `index.css`
- **THEN** every CSS custom property in `:root` begins with `--pen-`, `--pencil-`, `--space-`, `--ease-`, `--shadow-`, `--chart-`, `--party-`, or `--float-`

### Requirement: Color Palette

The `:root` block SHALL define the following color tokens with the specified values:

| Token | Value |
|---|---|
| `--pen-color-bg` | `#ffffff` |
| `--pen-color-surface` | `#f7f8fb` |
| `--pen-color-surface-alt` | `#f7f8fb` |
| `--pen-color-surface-elevated` | `#ffffff` |
| `--pen-color-text` | `#1c1c1e` |
| `--pen-color-text-muted` | `#636366` |
| `--pen-color-hero-blue` | `#355899` |
| `--pen-color-hero-blue-soft` | `#97b1de` |
| `--pen-color-hero-blue-softer` | `#c3d4f0` |
| `--pen-color-arrow-red` | `#c76a6e` |
| `--pen-color-danger` | `#b84848` |
| `--pen-color-divider` | `#b8b8be` |
| `--pen-color-border` | `#b8b8be` |
| `--pen-color-cut` | `#b84848` |
| `--pen-color-freeze` | `#5a8fc4` |
| `--pen-color-pass` | `#2a8f3e` |
| `--pen-color-env` | `#326d5e` |

#### Scenario: Hero blue is applied consistently

- **WHEN** the page renders
- **THEN** all accent elements (links, primary buttons, active nav items) use the computed value of `--pen-color-hero-blue` (`#355899`)

### Requirement: Spacing Scale

The `:root` block SHALL define an 8pt spacing scale from `--space-1` (4px) to `--space-10` (64px).

| Token | Value |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-7` | `32px` |
| `--space-8` | `40px` |
| `--space-9` | `48px` |
| `--space-10` | `64px` |

#### Scenario: Spacing tokens resolve to correct pixel values

- **WHEN** `getComputedStyle(document.documentElement).getPropertyValue('--space-6')` is called in the browser
- **THEN** the result is `24px`

### Requirement: Animation Curves

The `:root` block SHALL define three named easing functions:

| Token | Value |
|---|---|
| `--ease-spring` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| `--ease-out-expo` | `cubic-bezier(0.19, 1, 0.22, 1)` |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |

#### Scenario: Ease tokens are defined and non-empty

- **WHEN** `getComputedStyle(document.documentElement).getPropertyValue('--ease-spring')` is called
- **THEN** the result is a non-empty string (the cubic-bezier value is present and not the browser default)

### Requirement: Shadow System

Three shadow tokens SHALL be defined covering small, medium, and large elevation levels.

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)` |
| `--shadow-lg` | `0 4px 12px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)` |
| `--shadow-xl` | `0 8px 24px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.1)` |

#### Scenario: Shadow tokens are defined

- **WHEN** `getComputedStyle(document.documentElement).getPropertyValue('--shadow-md')` is called
- **THEN** the result contains `rgba(0,0,0,0.04)` and `rgba(0,0,0,0.06)`

### Requirement: Radius Scale

Border-radius tokens SHALL be defined for the three standard sizes:

| Token | Value |
|---|---|
| `--pencil-radius` | `20px` |
| `--pencil-radius-lg` | `24px` |
| `--pencil-radius-pill` | `980px` |

#### Scenario: Radius tokens resolve to correct values

- **WHEN** `getComputedStyle(document.documentElement).getPropertyValue('--pencil-radius-lg')` is called
- **THEN** the result is `24px`
