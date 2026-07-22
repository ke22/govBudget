## Context

`115MoneyDemoB-main/index-v2.html` is the review copy of the FY115 budget report. It is a static, single-file scrollytelling page whose hero, fixed Chapter 2 stage, sticky Chapter 3 stage, and Chapter 4 charts share viewport space with a fixed site header. Existing responsive work moved Chapter 2 and Chapter 3 charts into a top band on narrow screens, but the page still couples presentation to fixed offsets and to text embedded in the mobile hero bitmap. The last Chapter 2 history image remains active until the whole chapter has left the viewport, so it can cover the next chapter. Typography and UI colors are also set through a mixture of root tokens, selectors, and inline declarations.

The change must preserve the wide desktop composition, remain static-host compatible, avoid new runtime dependencies, support reverse scrolling, and respect reduced-motion preferences. The review copy remains the only HTML target until the viewport matrix passes.

## Goals / Non-Goals

**Goals:**

- Make hero text readable and collision-free at compact and intermediate widths without relying on coordinates baked into an image.
- Retire the Chapter 2 history visual before Chapter 3 becomes readable, with deterministic behavior in both scroll directions.
- Preserve meaningful Chinese heading phrases at line boundaries and reduce visual noise from excess type and UI color roles.
- Keep every chart panel and its outermost labels below the fixed header, including on a 1366 x 768 laptop viewport.
- Establish a repeatable viewport matrix that determines whether a shared responsive composition is sufficient.
- Preserve the existing editorial collage language, chapter order, data, and core scrollytelling concepts while refining how they adapt and move.
- Give compact, intermediate, and wide layouts explicit motion budgets so smaller screens remain readable without inheriting desktop displacement and sticky duration.
- Make all required content readable when JavaScript is unavailable or reduced motion is requested.

**Non-Goals:**

- Changing editorial wording, budget data, chart values, chart category semantics, navigation structure, or scrollytelling step order.
- Redesigning the wide desktop hero or generating a separate composition for every device model.
- Synchronizing the approved result into `115MoneyDemoB-main/index.html` during this change.
- Introducing a framework, third-party scroll library, device sniffing, or a build step.
- Performing unrelated cleanup in `115MoneyDemoB-main/database-v2.html` or other pages.
- Replacing the report with a generic Apple product-page aesthetic, copying fixed Apple scroll distances, or trading away the newspaper/editorial identity for engineering convenience.

## Decisions

### Refinement preserves the current editorial identity

The implementation preserves the existing color system, typography families, collage imagery, chapter order, copy, data, Chapter 1 timeline, and the core Chapter 2/3 relationship in which scrolling text drives visual state. "Apple-inspired" means disciplined hierarchy, deliberate viewport use, restrained motion, and clear state transitions; it does not mean replacing the report's newspaper collage language or turning the page into a generic product landing page.

Refinement may change proportions, content widths, alignment, whitespace, sticky duration, trigger positions, and breakpoint-specific simplification when those changes make the original intent more stable. Each chapter is implemented and visually reviewed as a bounded batch before work moves to the next chapter.

Rejected alternative: globally redesign the visual language while restructuring the implementation. That would make regressions difficult to attribute and would violate the preservation scope.

### Responsive behavior follows three motion tiers

Compact layouts at 640 CSS pixels and below use a single column and normal document flow. Long-lived sticky regions, large parallax-like displacement, and reveal states that gate readability are disabled; only necessary fades may remain. Intermediate layouts from 641 through 1024 CSS pixels use either a single column or a simplified text/visual composition per chapter, retain core chart-state changes, and reduce sticky duration and transform distance. Wide layouts at 1025 CSS pixels and above retain the alternating Chapter 1 timeline, sticky chart stages, and full scrollytelling sequence.

The same editorial content and semantic order serve all tiers. CSS owns ordering and layout; JavaScript only exposes state through classes or bounded CSS custom properties.

Rejected alternative: shrink the wide composition uniformly at smaller widths. That preserves coordinates rather than the reading experience and reproduces the current breakpoint collisions.

### Viewport-sized regions subtract the header once

The fixed header is compensated exactly once. Hero and sticky visual stages use the viewport space remaining below the header, expressed from `100svh` and the shared header token. Ordinary content sections remain content-driven and are not forced to fill a viewport. Safe-area inset and the documented visual gap are added without duplicating the header offset in both the page skeleton and the component.

Rejected alternative: combine body padding with a second component-level header offset. That makes the apparent first viewport taller than the available reading area and pushes compact controls into editorial copy.

### Scroll runways follow scene count and reading rhythm

Chapter 2 and Chapter 3 runway length is derived from the number of authored scenes and their reading requirements. A scene may reserve a viewport-proportional interval on wide screens, but the section does not use an arbitrary global height solely to imitate Apple-style scrolling. Compact layouts return cards to normal flow; intermediate layouts use shorter state intervals than wide layouts.

Rejected alternative: retain a fixed `850vh` runway independent of scene count and copy length. That couples pacing to a magic number and makes responsive refinement brittle.

### Responsive hero uses live semantic text and one clean shared asset

At compact and intermediate widths, the collage is decorative and contains no title, subtitle, or other required information. The existing visual source is edited into `115MoneyDemoB-main/hero-collage-mobile-clean.jpg`; the page renders the report title, subtitle, overdue stamp, dek, and scroll affordance as live HTML. The visible title is the semantic `h1`, so there is no duplicate screen-reader-only title at these widths.

The hero uses normal layout with stable rows for brand/header clearance, title, artwork, stamp/dek, and scroll affordance. It has a minimum viewport height but can grow when copy requires more space. Fixed `top` and `bottom` offsets are not used to stack text over other text. Wide desktop keeps the existing visual composition and accessible title behavior.

Rejected alternative: preserve the text-bearing bitmap and tune `background-position` plus fixed offsets. A single bitmap safe zone cannot remain valid across the required aspect ratios because `cover` changes both cropping and the apparent location of the baked title.

### RWD uses three layout bands and conditional bespoke composition

The responsive contract is based on available layout width, not user-agent or device detection:

- Compact: up to 640 CSS pixels.
- Intermediate: 641 through 1024 CSS pixels.
- Wide: 1025 CSS pixels and above.

The compact and intermediate bands share the clean hero asset and DOM structure, with different spacing, type roles, and artwork framing. The wide band preserves the current desktop hero. The acceptance matrix is 390 x 844, 430 x 932, 768 x 1024, 820 x 1180, 1024 x 768, 1366 x 768, and 1440 x 900.

A separate tablet artwork or markup composition is not part of the initial implementation. It becomes necessary when either 768 x 1024 or 820 x 1180 still fails one of these criteria after CSS framing adjustments: required artwork is cropped out, or live text overlaps artwork/stamp/dek at the minimum supported spacing. If a failure persists, implementation stops before creating an additional asset and reports the exact viewport and collision to the user for art-direction approval.

Rejected alternative: maintain phone, small-tablet, large-tablet, and desktop-specific markup from the start. That multiplies editorial and accessibility maintenance without evidence that the shared intermediate composition is insufficient.

### Chapter 2 visuals fade using final card geometry

The final Chapter 2 `.story-card` inside `data-rebuilt-step="9"` is the exit anchor. The existing scroll update computes an exit progress from that card's top edge:

- At or below 55% of viewport height, exit progress is 0 and the history visual is fully visible.
- From 55% to 35% of viewport height, exit progress increases linearly from 0 to 1.
- At or above 35% of viewport height, the history visual is transparent and hidden from visibility and hit testing.
- When the top of Chapter 3 reaches the viewport bottom, the Chapter 2 visual is forced into the hidden state even if rounding or a large scroll jump skipped the interpolation range.

The progress controls a dedicated exit class or CSS custom property on the Chapter 2 fixed stage; it does not overload the existing step classes that select Gantt and history content. Reverse scrolling recomputes progress from geometry and restores the visual without stale state. Scroll work remains inside the existing requestAnimationFrame path. Under `prefers-reduced-motion: reduce`, the visual switches once when the card crosses 45% of viewport height instead of interpolating opacity.

Rejected alternative: remove the fixed stage only when Chapter 2's bottom crosses the viewport top. That is the current lifecycle and is too late to protect the next chapter.

### Chinese headings wrap at authored phrase boundaries

Critical report and chapter headings are authored as semantic phrase spans separated by optional break opportunities. A phrase span does not break internally; the heading can wrap between spans. `text-wrap: balance` improves distribution where supported but is not the only control. The two known headings wrap as semantic pairs: `不是只有今年晚，` / `但今年最極端`, and `晚審影響` / `新興預算無法動支`.

Type sizes remain role-based but use bounded `clamp()` values inside the responsive contract so changes between supported widths are fluid without becoming unbounded. Compact chapter headings do not fall below 1.75rem, intermediate headings retain a 2rem target, and wide headings cap at the established 2.5rem. Primary Chinese body copy remains at least 16 CSS pixels; chart annotations and captions remain at least 12–13 CSS pixels. Small text uses a regular or medium weight rather than Thin or Light. Chinese body copy keeps conservative letter spacing, strict punctuation rules, and left alignment where justification produces visibly uneven spacing.

Rejected alternative: insert viewport-specific hard `<br>` elements. Hard breaks lock the title to one composition and produce poor results when text metrics or viewport width changes.

### Chart stages share header-aware viewport clearance

All Chapter 2, Chapter 3, and Chapter 4 chart stages use one chart-stage clearance token equal to the site header height, the top safe-area inset, and a 24px visual gap. Sticky visual stages cap their outer height to the viewport space remaining below the header; the whole panel moves while individual axes, plot areas, legends, and labels retain their internal coordinate relationship.

Wide viewports at 900 CSS pixels of height or less add 16px of short-laptop clearance. Chart panel maximum height is derived from the remaining viewport height after top clearance and a 24px bottom gap, so moving a panel down cannot push its bottom content outside the viewport. The topmost `96年度` label is the explicit Chapter 2 clearance sentinel.

Rejected alternative: increase only the Y-axis top offset. That would detach labels from their rows and would not solve header collisions in the other chart stages.

### Typography and color use editorial roles while charts retain semantic palette

The page exposes five typography roles: report display, chapter heading, chart/panel heading, body, and caption/label. Affected headings and copy stop defining font size, weight, line height, and color inline. The page exposes six non-data UI color roles: deep canvas, paper surface, primary ink, inverse ink, seal-red accent, and muted text/border. Seal red is reserved for editorial emphasis, active navigation, and critical status. Neutral controls use paper or muted roles instead of introducing yellow, teal, or additional red variants.

The five chart category colors remain separate because they encode budget categories or parties. Data colors are not reused for unrelated buttons, navigation, or decorative headings.

Rejected alternative: force charts into the same two-color UI palette. Removing category colors would reduce data comprehension and would conflate visual consistency with loss of meaning.

### Reduced motion and no-JavaScript states remain readable

Required editorial content is visible by default. JavaScript enhancement may add `is-active`, `is-revealed`, scene-step classes, or bounded progress variables, but it does not create the only readable state. Under `prefers-reduced-motion: reduce`, reveal transforms, parallax-like motion, and interpolated sticky exits are removed; all cards and required labels are directly readable, while essential chart state changes use immediate threshold switches.

Fixed utility controls remain hidden when they have no useful action, including the back-to-hero control while the hero is the active section. A no-JavaScript fallback never leaves an invisible content card or a fixed stage covering later chapters.

Rejected alternative: preserve animation CSS and merely reduce every duration to near zero. That can still leave content dependent on state classes and does not remove unnecessary sticky or transform behavior.

## Implementation Contract

**Behavior:**

- At every compact and intermediate matrix viewport, the hero shows a complete live title, subtitle, stamp, dek, and scroll affordance with no overlap, clipping, or horizontal overflow. The hero can exceed one viewport height when required by its copy.
- At compact and intermediate widths, fixed utility controls do not overlap hero editorial content; the back-to-hero control remains hidden until the hero is no longer the active section.
- Hero and sticky visual-stage minimum heights use the viewport space remaining below the fixed header. Ordinary report sections grow from content rather than a forced viewport height.
- Compact scenes use normal flow, intermediate scenes retain simplified state changes, and wide scenes retain the complete timeline/sticky/scrollytelling behavior.
- All primary Chinese body copy computes to at least 16 CSS pixels, chart annotations and captions compute to at least 12 CSS pixels, and role sizes remain within their documented `clamp()` bounds.
- With JavaScript disabled or reduced motion enabled, every required card and label remains directly readable without a reveal class or interpolated transform.
- At 390 x 844, the title and dek remain readable without covering each other or relying on text embedded in the image.
- As the final Chapter 2 story card moves from 55vh to 35vh, the history visual fades from fully opaque to fully transparent. It is hidden before any Chapter 3 heading or introductory copy becomes readable. Reverse scrolling restores the same states from position.
- Known Chinese headings break only between authored phrase spans. No phrase span exceeds its container at any matrix viewport.
- The outermost visible pixel of every chart title, label, legend, and plot remains below the header plus the required gap. At 1366 x 768, `96年度` does not touch or pass behind the header.
- UI text and controls use only the documented editorial roles; chart category colors remain available only to data encodings.

**Interface / data shape:**

- No public API or data shape changes.
- The existing scroll handler gains a Chapter 2 exit-progress calculation based on the final story card and Chapter 3 geometry.
- CSS receives layout-band tokens, chart-stage clearance tokens, editorial type/color roles, and a Chapter 2 exit state.
- Scene-state JavaScript exposes classes or bounded CSS variables; CSS remains responsible for element width, ordering, and primary positioning.
- One presentation asset is added: `115MoneyDemoB-main/hero-collage-mobile-clean.jpg`.

**Failure modes:**

- If JavaScript does not run, Chapter 2's fixed stage must not remain above Chapter 3 indefinitely; CSS section boundaries remain the fallback containment mechanism.
- Large scroll jumps force the stage hidden as soon as Chapter 3 reaches the viewport bottom.
- Missing clean hero artwork falls back to the deep canvas without hiding live title or dek content.
- Reduced-motion users receive a threshold switch without an animated fade.
- If the intermediate matrix still fails after CSS object-position and spacing adjustments, implementation reports the viewport-specific failure and does not silently create a separate tablet composition.
- If scene geometry cannot produce a stable runway from authored scene count, implementation reports the affected chapter and viewport rather than introducing a new unexplained `vh` magic number.

**Acceptance criteria:**

- Inspect all seven matrix viewports with browser screenshots and DOM overflow checks.
- At 390 x 844, 768 x 1024, and 1366 x 768, scroll through the full Hero-to-Chapter-3 path in both directions and confirm stable layering.
- At 1366 x 768, measure the header bottom and the topmost Chapter 2 chart label; the label top is at least 24 CSS pixels below the header bottom.
- At compact and intermediate widths, confirm the visible `h1` provides the report title and the decorative hero image contains no required textual information.
- Enable reduced motion and confirm Chapter 2 imagery switches at the 45vh threshold without an opacity animation.
- Disable JavaScript and confirm all compact, intermediate, and wide editorial cards remain readable in normal document order.
- At 390 x 844, confirm every fixed utility control is geometrically disjoint from the live title, subtitle, stamp, dek, and scroll affordance.
- Record computed body, caption, and annotation font sizes at 390, 768, 1024, and 1440 CSS pixels and confirm the documented minimums and caps.
- Run source checks confirming affected headings and controls no longer contain conflicting inline typography/color declarations and that no new runtime dependency is introduced.

**Scope boundaries:**

- In scope: responsive Hero composition, Chapter 2 visual exit behavior, affected report/chart headings, shared chart-stage clearance, UI role consolidation, the clean mobile/tablet Hero asset, and matrix verification in `115MoneyDemoB-main/index-v2.html`.
- In scope: breakpoint-specific Chapter 1–3 layout/motion simplification, scene-derived runway pacing, back-to-hero visibility, and directly readable no-JavaScript/reduced-motion states.
- Out of scope: published-file synchronization, data changes, chart sequencing changes, new navigation, database pages, framework migration, and unrelated visual cleanup.

## Risks / Trade-offs

- [Risk] Removing text from the mobile collage changes the visual balance. → Mitigation: preserve the source collage's subjects and paper texture, then verify crop framing at both compact and intermediate matrix sizes before accepting the asset.
- [Risk] Scroll-linked opacity work adds cost to an already busy handler. → Mitigation: reuse the existing requestAnimationFrame update, write one progress value, and avoid layout reads after style writes.
- [Risk] Phrase spans can overflow when an authored phrase is too long. → Mitigation: keep phrases short enough for 390 CSS pixels and verify container overflow at every matrix viewport.
- [Risk] Moving chart panels down can clip bottom axes on short viewports. → Mitigation: derive panel maximum height from the remaining viewport rather than preserving a fixed vh height.
- [Risk] Consolidating colors can accidentally remove data meaning. → Mitigation: inventory data encodings before replacing UI colors and leave chart category tokens unchanged.
