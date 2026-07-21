## Why

The report's mobile and tablet layouts rely on viewport-sized stages, fixed offsets, text baked into the hero image, and chapter visuals that remain active until an entire section leaves the viewport. These constraints cause hero content collisions, Chapter 2 imagery covering the Chapter 3 heading, chart labels crowding the fixed header on short laptops, and an inconsistent editorial hierarchy across device sizes.

## What Changes

- Rebuild the phone and tablet hero so the collage is presentation-only while the title, subtitle, overdue stamp, dek, and scroll affordance participate in a responsive document layout.
- Introduce an explicit Chapter 2 exit lifecycle: the history visual fades as the final story card crosses the reading midpoint and is fully hidden before Chapter 3 enters.
- Give Chinese headings controlled phrase boundaries and breakpoint-specific sizes so line wraps preserve meaning without shrinking body text globally.
- Apply a shared header-aware viewport clearance to every chart stage, with additional accommodation for short laptop viewports.
- Consolidate UI typography and color usage into a small set of editorial roles while retaining chart category colors that carry data meaning.
- Validate three layout bands (phone, tablet, desktop) across a fixed viewport matrix. A separate tablet composition is created only if the shared responsive composition cannot meet the documented collision and framing criteria.
- Extend the three-band contract beyond the hero: compact layouts use normal document flow and minimal motion, intermediate layouts keep core state changes with simplified positioning, and wide layouts retain the full timeline, sticky charts, and scrollytelling.
- Size viewport-driven regions from the space remaining below the fixed header, keep ordinary sections content-driven, and derive scroll runways from scene count and reading rhythm instead of a fixed Apple-like distance.
- Use bounded `clamp()` typography with readable Chinese minimums, and guarantee that reduced-motion and no-JavaScript states expose all editorial content without requiring a reveal animation.
- Prevent fixed utility controls, including the back-to-hero control, from covering live hero copy at compact and intermediate widths.

## Capabilities

### New Capabilities

- `responsive-editorial-hero`: Responsive hero composition, semantic live text, and device-size framing requirements.
- `chapter-visual-exit`: Scroll-linked retirement of Chapter 2 visuals before the following chapter becomes readable.
- `editorial-type-and-color-hierarchy`: Chinese heading wrapping plus a constrained set of editorial typography and UI color roles.
- `chart-viewport-clearance`: Header-aware chart placement and short-viewport clearance across report chapters.
- `responsive-storytelling-motion`: Three-band layout and motion complexity, scene-derived scroll runways, and directly readable reduced-motion/no-JavaScript states.

### Modified Capabilities

(none)

## Impact

- Affected specs: responsive-editorial-hero, chapter-visual-exit, editorial-type-and-color-hierarchy, chart-viewport-clearance
- Affected code:
  - Modified: `115MoneyDemoB-main/index-v2.html`
  - New: `115MoneyDemoB-main/hero-collage-mobile-clean.jpg`
  - Removed: none
- No API, persistence, or dependency changes.
- The published `115MoneyDemoB-main/index.html` remains unchanged until the review copy passes the viewport acceptance matrix and is approved for synchronization.
