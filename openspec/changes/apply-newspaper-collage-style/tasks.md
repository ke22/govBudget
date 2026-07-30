## 1. Newsprint tokens

- [x] 1.1 Add the `--np-ink`, `--np-paper`, `--np-paper-panel`, `--np-seal-red`, `--np-seal-red-dark`, `--np-muted`, and `--np-hairline` custom properties to `:root` in `115MoneyDemoB-main/index.html`, delivering "Newsprint tokens are additive and scoped": the existing `--primary`/`--accent`/`--danger`/`--bg-deep`/`--bg-card`/`--text-main`/`--text-muted`/`--border` tokens keep their current values unchanged. Verify with `grep -n -- '--np-' 115MoneyDemoB-main/index.html` returning all seven names, and a diff review confirming no existing token's value line changed.

## 2. Hero collage treatment

- [x] 2.1 Restyle `.hero-section` so it renders as a full-bleed collage visual with a jagged torn bottom edge (`clip-path`), delivering "Hero renders as a torn-edge newsprint collage". Verify by loading the page in a desktop browser and confirming the hero shows a torn bottom edge instead of the current plain gradient.
- [x] 2.2 Restyle the "203天" stat as a red-bordered circular stamp overlapping the hero's torn edge, per the "Hero becomes a full-bleed collage image with a torn bottom edge" decision. Verify visually that the stamp overlaps the torn edge and stays legible against the underlying collage art.
- [x] 2.3 Repoint `.hero-title`, `.hero-title span`, `.hero-meta`, and `.scroll-indicator` text colors from `--text-main`/`--text-muted`/`--primary` to `--np-ink`/`--np-muted`. Verify with `grep -n 'hero-title\|hero-meta\|scroll-indicator' 115MoneyDemoB-main/index.html` showing only `--np-*` token references in their color declarations.

## 3. Story-card torn-clipping treatment

- [x] 3.1 Update the base `.story-card` rule (background, border, border-radius, box-shadow, rotation) to the torn-edge clipping treatment from "Scope new tokens to hero/story-card, do not touch the shared teal tokens" and "`.story-card` gets a torn-edge clipping treatment in both its base rule and its two mobile overrides", delivering "Story cards render as torn paper clippings, consistently across breakpoints" for the desktop case. Verify at a desktop viewport (≥969px) that all `.story-card` instances show the torn bottom edge, rotation, box-shadow, and `--np-paper-panel` background.
- [x] 3.2 Repoint `.story-card h2` and `.story-card p` text colors from `--primary`/`--text-main` to `--np-ink`. Verify with `grep -n 'story-card h2\|story-card p' 115MoneyDemoB-main/index.html` showing `--np-ink` in both color declarations.
- [x] 3.3 Update chapter 1's mobile `.story-card` override (currently `rgba(255,255,255,0.95)`) to use `var(--np-paper-panel)`, fully opaque. Verify at a 390×844 mobile viewport inside chapter 1 that the card background is the newsprint cream tone, not white.
- [x] 3.4 Update the pinned-band mobile `.story-card` override shared by chapters 2-3 (currently hardcoded `#ffffff`) to use `var(--np-paper-panel)`, fully opaque, completing "Story cards render as torn paper clippings, consistently across breakpoints" for both mobile cases. Verify at a 390×844 mobile viewport inside chapters 2 and 3 that the card background is the newsprint cream tone and does not visually overlap the pinned Gantt chart band above it.

## 4. Regression check

- [x] 4.1 Confirm "Gantt charts remain visually unchanged": compare the Gantt chart bar colors, legend colors, and active-state border colors in chapters 2-3 before and after this change. Verify by screenshot comparison (or manual color-value check against `--primary`/`--accent`/`--danger`) showing no visual difference.
