## Context

`115MoneyDemoB-main/index.html` is a single-file scrollytelling report (~3,478 lines: CSS, HTML, and JS together) covering Taiwan's FY115 central government budget review delay. Its current `:root` tokens (`--bg-deep`, `--bg-card`, `--text-main`, `--text-muted`, `--primary: #008080`, `--accent: #00a896`, `--danger: #E74C3C`, `--border`) are a generic teal/white template palette, shared across roughly 45 call sites: the hero, `.story-card` (19 instances across chapters 1–4), nav-adjacent elements, timeline badges, CTA buttons, and the Gantt chart bars/legend in chapters 2–3.

A standalone mockup (built and iterated this session, published as a Claude Artifact) validated a newspaper-clipping collage direction: an ink/cream/red "newsprint" palette, a full-bleed collage hero image with a torn bottom edge and a red ink-stamp accent, and story-cards restyled as torn paper clippings. `/spectra-discuss` converged on carrying this into production, scoped to the hero and story-card only — explicitly excluding the Gantt charts.

The production file also has two mobile-specific `@media (max-width: 968px)` override blocks for `.story-card`: one under chapter 1's `.local-sticky-stage`/`.step-scene` mobile layout, and one shared by the pinned-band mobile layout used by chapters 2–3 (`chapter-2-rebuilt`/`chapter-3-rebuilt`). Both currently hardcode an opaque white background (`#ffffff` / `rgba(255,255,255,0.95)`) directly, bypassing `--bg-card` entirely — this was a deliberate earlier fix (per inline comments) to stop translucent cards from reading as illegible dark boxes on mobile. Any restyle of `.story-card` must update these two hardcoded values too, or mobile cards will stay white while desktop turns cream.

## Goals / Non-Goals

**Goals:**

- Hero and story-card share one cohesive "newsprint" visual identity, matching the validated mockup.
- The hero becomes a collage-style visual (full-bleed image, torn edge, stamp accent) instead of a plain text block on a gradient.
- `.story-card` (base rule + both mobile overrides) reads as a torn paper clipping: torn bottom edge, slight rotation, box-shadow, newsprint coloring.
- Desktop and mobile story-cards use the same underlying newsprint tokens (no hardcoded hex colors left behind that silently diverge from the token system).

**Non-Goals:**

- No changes to the Gantt chart bars, legend, or any chart-adjacent CSS in chapters 2–3. `--primary`/`--accent`/`--danger`/`--bg-deep`/`--bg-card`/`--border`/`--text-main`/`--text-muted` remain defined exactly as they are today and keep their current values — they are not renamed, removed, or repointed, because ~45 call sites outside the hero/story-card scope (nav, CTA buttons, timeline badges, charts) depend on them.
- No changes to the mobile pinned-band scrollytelling mechanics themselves (stage heights, JS scroll-step thresholds, `data-rebuilt-step` visibility toggles) — only the `.story-card` component's own visual styling changes.
- No changes to JavaScript logic or data files.
- No dark-mode-specific tuning beyond reusing the same token values the production file's existing dark-mode variables already provide (this file has no dark/light toggle today — new tokens are defined once, not theme-conditional).

## Decisions

### Scope new tokens to hero/story-card, do not touch the shared teal tokens

Add a small set of new custom properties in `:root`, independent from the existing `--primary`/`--accent`/`--bg-*`/`--text-*`/`--border` tokens:

```css
--np-ink: #1B1712;
--np-paper: #F1EAD6;
--np-paper-panel: #E6DAB9;
--np-seal-red: #A5271E;
--np-seal-red-dark: #7E1D16;
--np-muted: #6B6156;
--np-hairline: rgba(27, 23, 18, 0.16);
```

(Values are the exact ones validated in the mockup, `--np-` prefixed so they cannot collide with or be confused for the existing token names.) `.hero-section`, `.hero-title`, `.hero-title span`, `.hero-meta`, `.scroll-indicator`, `.story-card`, `.story-card h2`, `.story-card p`, and both mobile `.story-card` override rules are repointed to these new tokens. Every other selector in the file keeps referencing the existing tokens unchanged.

Rejected alternative: renaming `--primary`/`--accent` in place to the newsprint colors. Rejected because both are read by the Gantt chart code (chart bar fills, legend swatches, active-state borders) which is explicitly out of scope — an in-place rename would silently reskin the charts too.

### Hero becomes a full-bleed collage image with a torn bottom edge

`.hero-section` gets a collage-style background/image treatment (the same visual asset direction proven in the mockup: a composed newspaper-clipping image, or an equivalent CSS-built collage if no production-ready image asset is supplied), clipped with a jagged-bottom `clip-path` (the same coordinate set used in the mockup: `polygon(0% 0%,100% 0%,100% calc(100% - 8px),96% 100%,90% calc(100% - 3px),84% 100%,78% calc(100% - 6px),72% 100%,66% calc(100% - 2px),60% 100%,54% calc(100% - 7px),48% 100%,42% calc(100% - 3px),36% 100%,30% calc(100% - 6px),24% 100%,18% calc(100% - 2px),12% 100%,7% calc(100% - 6px),3% 100%,0% calc(100% - 8px))`), with the "203天" stat re-styled as a red-bordered circular stamp overlapping the torn edge (`mix-blend-mode: normal` with a solid `--np-paper-panel` backing, matching the mockup's final approach — not `multiply`, since the underlying image content varies and multiply produced inconsistent contrast against busy image regions).

### `.story-card` gets a torn-edge clipping treatment in both its base rule and its two mobile overrides

Base rule: background switches from `var(--bg-card)` to `var(--np-paper-panel)`, border switches from `var(--border)` to a left `3px solid var(--np-seal-red)` accent, corner `border-radius` is replaced by the same bottom `clip-path` used elsewhere, and a slight `rotate(-0.4deg)` plus a `box-shadow: 0 10px 22px rgba(27,23,18,0.18)` is added. `.story-card h2`/`p` colors switch from `--primary`/`--text-main` to `--np-ink` (with the red accent reserved for the left border only, echoing the hero stamp).

Both mobile override rules (chapter 1's, and the chapters 2–3 pinned-band shared one) must be updated in the same pass: their hardcoded `#ffffff`/`rgba(255,255,255,0.95)` backgrounds become `var(--np-paper-panel)` (fully opaque, no `backdrop-filter`, matching their original intent of guaranteeing legibility on mobile — just recolored). This keeps desktop and mobile visually consistent instead of desktop going cream while mobile stays white.

## Implementation Contract

**Behavior**: On both desktop and mobile, the hero section renders as a full-bleed collage-style visual with a torn bottom edge and a red circular "203天" stamp overlapping that edge; the existing hero headline/dek text remains present and legible, now set in the `--np-ink`/`--np-muted` newsprint colors instead of the current teal/black-on-white. Every `.story-card` instance (all 19, across chapters 1–4, in both its default desktop appearance and both mobile breakpoints) renders as a slightly rotated, bottom-torn cream paper clipping with a red left-border accent, instead of today's frosted rounded rectangle.

**Interface / data shape**: No JS, data, or markup-structure changes — this is CSS-only (new `:root` custom properties plus repointed `background`/`color`/`border`/`clip-path`/`transform`/`box-shadow` declarations on the named selectors above). No new HTML elements are required unless the hero's collage image needs a wrapping element for the torn-edge clip-path to apply to an `<img>` rather than a CSS `background`; if so, that wrapper is added only inside `.hero-section`.

**Failure modes**: N/A at runtime (static CSS, no error states). The observable "failure" to avoid is visual drift: any `.story-card` instance or override left pointing at the old `--bg-card`/`--border`/`--primary` tokens after this change is a defect, as is any hero or story-card selector accidentally repointed to `--np-*` tokens leaking into chart-adjacent CSS.

**Acceptance criteria**:
- Manual verification: load `115MoneyDemoB-main/index.html` in a desktop browser and confirm the hero and all `.story-card` instances in chapters 1–4 show the newsprint treatment (torn edges, rotation, ink/cream/red coloring).
- Manual verification at a mobile viewport (390×844 in DevTools device mode, matching the width used in this session's earlier mobile QA): confirm `.story-card` in chapter 1 and in the chapters 2–3 pinned-band layout is fully opaque, newsprint-colored (not white), and does not overlap the pinned Gantt chart band.
- `grep -c 'var(--bg-card)\|var(--border)' 115MoneyDemoB-main/index.html` returns `0` for the selectors this change touches (i.e., no story-card selector still references the retired tokens) — chart-adjacent selectors are expected to keep referencing `--primary`/`--accent`/`--danger`/`--bg-deep` unchanged.
- Desktop rendering of the Gantt chart (bar colors, legend, active-state borders) in chapters 2–3 is pixel-identical to before this change.

**Scope boundaries**: In scope — `.hero-section`, `.hero-title`, `.hero-title span`, `.hero-meta`, `.scroll-indicator`, `.story-card` (base + both mobile overrides), and the new `--np-*` token definitions in `:root`. Out of scope — the Gantt chart CSS and its tokens, the mobile pinned-band JS/mechanics, the nav, CTA buttons, timeline badges, and any other component not listed above.

## Risks / Trade-offs

- [Risk] Recoloring `.story-card` without also updating its two mobile overrides leaves mobile cards white while desktop turns cream, reintroducing the exact desktop/mobile inconsistency this change is meant to fix. → Mitigation: both override rules are named explicitly in scope above and covered by the acceptance criteria's mobile-viewport check.
- [Risk] A torn-edge `clip-path` combined with the existing mobile pinned-band overlap-avoidance spacing (tuned earlier this session) could reintroduce visual overlap if the rotated/clipped card's effective bounding box grows unexpectedly. → Mitigation: acceptance criteria requires an explicit mobile-viewport overlap check before this change is considered done, not just a desktop screenshot.
- [Risk] `.story-card h2` currently uses `var(--primary)` for its heading color; if an implementer greps only for `--bg-card`/`--border` and misses the `h2`/`p` color rules, the card would get new torn-edge geometry but keep the old teal heading color, an inconsistent half-migration. → Mitigation: Implementation Contract explicitly lists `.story-card h2`/`p` color as in scope.
