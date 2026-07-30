# Handoff — `index.html` frontend perf + mobile scrollytelling + newsprint visual identity

_Last updated: 2026-07-30 · Branch: `fe-polish-2026-07-16` (see 2026-07-30 update below for current state)_

## Update — 2026-07-30

Everything described below (perf, mobile scrollytelling, newsprint visual identity) is now
**fully merged into `main`** — `optimize-index-frontend-perf` merged, plus several more
branches on top of it since (`chapter-2-refine`, `footer-dates-and-credits` ×2,
`v2-hero-and-timeline-updates`, `perf-a11y-refine`, `timeline-refine`, PRs #3–#8). The
"Pending / next steps" list further down is **stale** — treat it as historical, not a live
TODO list. Only PR #6 (`design-system-docs`) is currently open/unrelated to this workstream.

This session's work, on branch `fe-polish-2026-07-16`:
1. **Committed 5 previously-"done"-but-uncommitted openspec changes** that had been sitting
   as untracked directories for weeks: `gov-budget-dashboard`, `align-pencil-design-system`,
   `apply-newspaper-collage-style`, `upgrade-typography-and-charts`, `fe-polish-2026-07-16`
   (one commit each, plus one commit for the shared Spectra tooling scaffold —
   `AGENTS.md`/`CLAUDE.md`/`GEMINI.md`/`.spectra.yaml`/`.agents/`/`.github/`). Opened as
   PR #9, merged.
2. **Footer 製作 credit block, two follow-up style changes** (both on top of PR #9, opened as
   PR #10, merged):
   - Reverted commit `d431baa` ("stack 製作 names one per line") back to the original
     comma-separated (`、`) single-line style, via `git revert` (not a manual re-edit — see
     `LEARNINGS.md` #23 for why that matters).
   - Then split the reverted line into two **fixed** rows (4 names / 3 names) via an
     explicit `<br>` between 林廷軍 and 林湘芸, so the break doesn't depend on viewport width.
   - Applied to all 4 copies: `index.html`, `database.html`, and their
     `115MoneyDemoB-main/` mirrors.
3. **Left a pile of untracked, unrelated files in the repo root uncommitted on purpose** —
   zip archives, screenshots, `.psd`/`.jpg` scratch images, `demo.rtf`, duplicate
   `115MoneyDemoB-main 2/`/`Demo_E-main/` folders, Chinese-named `.md`/`.doc` files. These
   look like personal scratch files dropped into the repo directory (e.g. via Finder), not
   project files — flagged to the user, not deleted. Still sitting as untracked in
   `git status` as of this writing; nobody has decided to clean them up yet.

## What this work is

`115MoneyDemoB-main/index.html` is a single-file CNA-style scrollytelling page
(「總預算卡關 203 天」) about the 115 central-government budget review. Three workstreams:

1. **Frontend performance** (Spectra change `optimize-index-frontend-perf`) — done & **committed**.
2. **Mobile scrollytelling layout fix** (plan-mode plan, no Spectra tasks) — done & **committed**.
3. **Newsprint visual identity** (two Spectra changes + ad-hoc follow-ups) — done, **uncommitted**.

## State of the branch

- Branch `optimize-index-frontend-perf`, pushed to `origin` as of commit `810bc28`. PR: https://github.com/ke22/govBudget/pull/new/optimize-index-frontend-perf
- Commits since: `b0b384c` (mobile pinned-band layout), `fad9d38` (mobile photo/overlap refinements), `8ccaf65` (perf: narrow `transition:all`, revert history-photo steps to desktop layout). **All committed.**
- `115MoneyDemoB-main/index.html` currently has **uncommitted** changes on top of `8ccaf65` — the entire newsprint visual identity workstream (see below). Nothing from workstream 3 has been committed yet.
- `115MoneyDemoB-main/hero-collage.jpg` is a new **untracked** file (~430KB JPEG, the real embedded hero image).
- `database-c.html` shows modified in git at the repo root — **pre-existing, not ours; leave it.**
- `plans/README.md` still lists plan 001 (narrow `transition:all`) as `TODO`, but it was actually done in `8ccaf65` — the plans README wasn't updated when that commit landed. Minor doc drift, not blocking.

## Done — performance (committed)

All in `index.html`, desktop pixel-identical (changes behind `@media`/`matchMedia`):
- Coalesced the two unthrottled, non-passive scroll handlers (`updateChapter2Stage`,
  `updateChapter3Bars`) into ONE `{ passive: true }` listener running once/frame via
  `requestAnimationFrame` (`onScrollFrame` + `scrollRafPending` flag).
- Fixed/sticky stages `100vh` → `100dvh` (with `100vh` fallback line before): 4 stages.
- Added `@media (prefers-reduced-motion: reduce)` block (end of `<style>`).
- Narrowed a `transition: all` to specific properties on the Gantt container (`8ccaf65`).
- **Bar transform:scaleX was intentionally descoped** — see `LEARNINGS.md` #2.
- Spectra change `optimize-index-frontend-perf`: tasks 1/10/11/12 (browser screenshot/trace
  verification) were left open due to no Chrome extension connection; not revisited since.

## Done — mobile scrollytelling (committed)

All inside `@media (max-width: 968px)` + one `matchMedia`-guarded JS line. Desktop untouched.
- **No more card-over-chart overlap:** chapter-2 (`.gantt-fixed-stage-rebuilt`) and
  chapter-3 (`.gantt-sticky-box-rebuilt`) pinned as opaque **top bands** (~60dvh / ~55dvh),
  cards flow in the lower reading zone.
- **Chart fits (not scaled):** the chapter-2 Gantt is **reflowed** for mobile (tighter frame,
  smaller fonts/rows), no `transform: scale()`.
- **Chapter-3 sync:** step trigger offset switches to `~0.6×innerHeight` on mobile.
- **Chapter-2 steps 7–9 history photos:** reverted back to the desktop centered-card
  treatment (small white card in the pinned band) per a later user request — the earlier
  full-bleed full-screen takeover for these steps was removed in `8ccaf65`.

## Done — newsprint visual identity (UNCOMMITTED)

Two formal Spectra changes plus ad-hoc follow-ups, all layered on the same uncommitted
`index.html` diff:

### 1. `apply-newspaper-collage-style` (9/9 tasks done, never archived)
- New `--np-*` token set (ink/paper/paper-panel/seal-red/muted/hairline), originally scoped
  to hero + `.story-card` only.
- Hero rebuilt as a full-bleed collage image (`hero-collage.jpg`, real embedded file — not
  base64) with a torn-bottom `clip-path` edge and a red circular "203天" stamp.
- All 19 `.story-card` instances (base rule + 2 mobile overrides) restyled as torn-paper
  clippings: cream background, red left border, slight rotation, box-shadow.
- Gantt charts explicitly **untouched** by this change (by design).
- **Not yet archived** into `openspec/specs/` — flagged, not actioned.

### 2. Ad-hoc full-page dark-background pass (no Spectra change, done directly)
- Flipped `--bg-deep` from light to dark (`#12191A`) to match the hero, added
  `--np-text-ondark` / `--np-muted-ondark` / `--np-seal-red-bright` / `--np-gold-bright`
  tokens for text sitting directly on the dark page background (as opposed to text inside
  light cards, which keeps `--text-main`/`--np-ink`).
- Retinted `--primary`/`--accent` from teal to seal-red/brass; swept all `rgba(0,128,128,...)`
  → `rgba(165,39,30,...)`.
- Required auditing ~19+13 individual `--text-main`/`--text-muted` usages against their
  actual rendered background (page vs. light card) — not a blanket flip. See prior session
  transcript if a similar audit is needed again.

### 3. `upgrade-typography-and-charts` (7/7 tasks done)
- Added `--font-display` (serif, headings) / `--font-body` (sans, body) tokens.
- Formalized the chapter-3 stacked-bar chart's 5-category palette as `--chart-cat-*` tokens
  (neutral/impact/new/extend/reserve), muted-but-hue-diverse (not strict 3-tone), to
  preserve 5-way legibility.
- **Design flaw caught & fixed during apply:** `--chart-cat-neutral` was originally
  `#7A6F5D`, only 1.6° of hue from `--chart-cat-reserve` (`#A8823C`) — indistinguishable in
  a stacked bar. Corrected to `#6E7268` (≥33° hue separation from all others). User
  authorized this correction explicitly ("go").
- **Tasks 3.1/3.2 (regression verification) were closed via a static-diff method**, not a
  literal screenshot/DevTools check — no Chrome extension was connected all session. The
  method: `git diff` was reviewed line-by-line and confirmed to contain only
  `color:`/`font-family:` value changes and new `:root` token definitions, with zero
  additions/removals of `position`/`width`/`height`/`margin`/`padding`/`transform`/
  `z-index`/`display`/`flex`/`grid` on any selector, and specifically zero touches to
  `.gantt-fixed-stage-rebuilt`, `.gantt-sticky-box-rebuilt`, `.story-card`, or their
  `@media (max-width: 968px)` overrides. This substitution is documented explicitly in
  `openspec/changes/upgrade-typography-and-charts/design.md` (Acceptance Criteria + Risks)
  — **a literal visual check is still recommended** whenever a browser is available, it's
  just not treated as blocking.

### 4. Halftone dot pattern (網點) on page background — ad-hoc, just done, UNRESOLVED
- `body` (`index.html:74-85`) got `background-image: radial-gradient(circle, rgba(237,
  230, 211, 0.08) 1px, transparent 1.2px); background-size: 4px 4px;` — a fine cream-on-dark
  halftone texture to strengthen the newsprint feel.
- **Open question, not yet resolved:** user asked to make this "better for mobile RWD" but
  the discussion never converged on what specifically was wrong (density? visibility on
  high-DPI phone screens? something else?). No follow-up answer was given before this
  handoff was requested. **Next agent/session: re-open this question with the user before
  changing the dot pattern further** — don't guess at a fix.
- Technical note for whoever picks this up: `background-size: 4px 4px` is a fixed physical
  CSS-px size, so it does NOT scale with viewport width — a phone renders the same dot grid
  as desktop. If the real complaint turns out to be performance or visual noise on
  high-DPI/small screens, a mobile media-query override on `background-size` (e.g. larger
  dots, lower opacity) would be the fix, not a viewport-relative unit.

## Pending / next steps

1. **Resolve the halftone dot pattern mobile question first** (see above) — ask the user
   what specifically looked wrong before changing values.
2. **Commit the newsprint visual identity work** once the dot-pattern question is settled —
   currently all uncommitted (`apply-newspaper-collage-style` + `upgrade-typography-and-charts`
   + the ad-hoc dark-background pass + the dot pattern, all layered in the same working-tree
   diff on `index.html`, plus the untracked `hero-collage.jpg`).
3. Consider archiving `apply-newspaper-collage-style` into `openspec/specs/` (never done).
4. `upgrade-typography-and-charts` can be archived with `/spectra-archive` (all 7 tasks done).
5. Update `plans/README.md` to mark plan 001 as done (doc drift from `8ccaf65`).
6. Whenever a Chrome extension connection is available: run the literal visual checks that
   were substituted with static-diff evidence — full-page desktop screenshot comparison,
   and 390×844 DevTools mobile check of chapters 2–3 for chart/story-card overlap.

## How to test

A local preview server has been running on port 8010 for this session's newsprint work:
```
cd 115MoneyDemoB-main && python3 -m http.server 8010
```
Open `http://localhost:8010/index.html`. For phone testing (as used for the earlier mobile
scrollytelling work), bind to `0.0.0.0` and use the machine's LAN IP instead. Desktop check
≥969px must stay pixel-identical across all workstreams above.

## Learnings

See `LEARNINGS.md` in this directory.
