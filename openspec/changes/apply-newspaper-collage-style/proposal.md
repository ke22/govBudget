## Why

The `115MoneyDemoB-main/index.html` scrollytelling report currently uses a generic teal-and-white template palette (`--primary: #008080`, plain white hero) that has no connection to its subject — Taiwan's FY115 central government budget review delay. A standalone mockup (newspaper-clipping collage hero, ink/cream/red palette, torn-edge story cards) was built and validated through design discussion this session. This change carries that validated direction into the production file.

## What Changes

- Introduce a new set of newsprint-specific tokens (ink/paper/paper-panel/seal-red/muted/hairline, matching the values validated in the mockup) scoped to the hero and story-card components only. The existing `--primary`/`--accent`/`--danger`/`--bg-deep`/`--bg-card`/`--text-main`/`--text-muted`/`--border` tokens are shared with the nav, CTA buttons, timeline badges, and Gantt charts (~45 call sites outside the hero/story-card scope) and are left untouched, since re-theming them is explicitly out of scope for this change.
- Redesign `.hero-section`/`.hero-title` into the newspaper-clipping collage treatment: full-bleed collage-style hero art with a torn bottom edge, the "203天" stat as a stamp element overlapping the torn edge, an eyebrow tag, and the existing dek paragraph restyled onto the new newsprint tokens.
- Restyle `.story-card` (19 instances across chapters 1–4, including its base rule and the two mobile-breakpoint override rules used by chapter 1's mobile layout and by the pinned-band mobile layout in chapters 2–3) with a torn bottom edge (clip-path), a slight rotation, and a box-shadow, recolored to the new newsprint tokens instead of `--bg-card`/`--border`/`--primary`.

## Capabilities

### New Capabilities

- `newsprint-visual-identity`: The ink/cream/red token system (scoped to hero and story-card), the hero collage treatment, and the story-card torn-edge treatment that together define this page's visual identity, as validated in the standalone mockup this session.

### Modified Capabilities

(none)

## Impact

- Affected specs: newsprint-visual-identity
- Affected code:
  - Modified: 115MoneyDemoB-main/index.html
  - New: (none)
  - Removed: (none)
