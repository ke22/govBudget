# Handoff — `index-v2.html` / `database-v2.html` (the "-v2" workstream)

_Last updated: 2026-07-22 · Branch: `optimize-index-frontend-perf`_

## What this is

`index-v2.html` and `database-v2.html` are **duplicate copies** of the live
`index.html` / `database.html`, created by Spectra change `polish-index-database-v2`
so rounds of user-reported fixes could be iterated on without touching the
production pages. This is a **separate file** from `115MoneyDemoB-main/index.html`
— see `HANDOFF.md` / `LEARNINGS.md` for that page's own (committed) perf +
newsprint-identity history. Nothing in this document affects the live
`index.html`/`database.html`.

## Current state: everything triaged so far is shipped

Seven Spectra changes have landed on `index-v2.html`, all archived, all pushed.
`database-v2.html` only received the first one.

| Change | Tasks | Scope |
|---|---|---|
| `polish-index-database-v2` | 23/23 | Created the `-v2` duplicates; 21 layout/copy/interaction fixes across both pages |
| `stabilize-responsive-story-layout` | 23/23 | Responsive hero, editorial type/color roles, 3-tier (compact/intermediate/wide) layout+motion contract, header-aware chart clearance, Chapter 2 exit lifecycle |
| `refine-v2-mobile-hero-cards-axis` | 8/8 | Scroll-indicator clipping, CJK line-breaking, mobile Ch2/3 card motion rework, Chapter-4 axis de-crowd/align |
| `fix-responsive-story-acceptance-gaps` | 14/14 | Hero stamp/title collision margin, Ch2 Gantt intermediate-width frame, Ch2 step-9 card/image sequencing, Ch2→3 exit guard extension |
| `refine-chapter1-timeline-choreography` | 11/11 | Ch1 timeline 40px line-lead, pulsing-"?"/arrow terminal marker, 641-1024px reveal extension |
| `refine-chapter2-chapter3-reveal-choreography` | 13/13 | Ch2 card-1 gray state, Ch3 grey-bar distinct reveal, Ch3 sticky-box centering, Ch3 intro-reveal gating |
| `polish-story-page-visual-hierarchy` | 7/7 | Desktop scroll-indicator contrast, footer border separation, enlarged ≤1024px hero stamp + recomputed collision margin |

All archived under `openspec/changes/archive/2026-07-21-<name>/`. The first
three were verified via browser screenshots + DOM overflow checks across a
7-viewport matrix in a prior session. **The latter four were verified via
source-level geometric/logical review only** — this session's browser
automation cannot reach `localhost` dev servers in this environment
(`chrome-error://chromewebdata/` despite `curl` returning 200, confirmed on
multiple separate attempts across two sessions) — user explicitly signed off
on proceeding this way. If that environment issue ever gets fixed, a real
visual pass over all seven changes would be worth doing.

On top of the seven changes, one small ad-hoc CSS edit (not a formal Spectra
change) landed 2026-07-21: `.hero-stamp-wrap` at `≤1024px` moved from pinned
upper-right (`right: clamp(16px, 5vw, 42px)`) to horizontally centered
(`left: 50%; transform: translateX(-50%) scale(0.9)`), desktop explicitly
excluded per user instruction.

`openspec/specs/` has an accepted baseline for all of: `responsive-editorial-hero`,
`chapter-visual-exit`, `editorial-type-and-color-hierarchy`, `chart-viewport-clearance`,
`responsive-storytelling-motion`, `mobile-scrollytelling-card-motion`, `cjk-line-breaking`,
`hero-scroll-indicator-visibility`, `chapter4-axis-mobile-legibility`,
`project-card-keyword-tags`, `desktop-pill-row-scroll`, `chapter1-timeline-motion-choreography`,
`chapter2-chapter3-reveal-refinements`, and `story-page-visual-hierarchy-polish`.
Any future work on this file should diff against this baseline.

## What's actually left: three items handed off for manual verification

The full triage lived in `ISSUE-TRIAGE-v2.md` (originally 4 buckets of raw
observation notes). Every bucket is now either shipped (table above) or
resolved down to these three, which need a live browser check before any more
code gets written — see `ISSUE-TRIAGE-v2.md`'s Bucket C/D rows for full detail:

1. **Grey total-budget bar animation** ("I want `#ch3-bar-total-grey`. Also
   have animation with th…") — user confirmed this means the grey bar should
   have its own reveal animation. **Likely already satisfied** by
   `refine-chapter2-chapter3-reveal-choreography`'s distinct transition
   (1.2s width-grow + delayed glow, vs. the shared 0.8s used by other bars).
   Needs the user to confirm the live behavior matches intent.
2. **"Cover chap 3"** — user confirmed this means Chapter 3 looks covered/
   hidden underneath another section right as you scroll into it. This is
   exactly the territory `fix-responsive-story-acceptance-gaps`'s exit-guard
   extension targeted. Unclear whether this is still happening after that fix,
   or whether the user was describing the original (now-fixed) symptom.
   Needs a live repro to tell which.
3. **Scroll-indicator not centered on phone** — user confirmed this is about
   phone width specifically (not the non-standard "735px" the raw note
   mentioned). Re-checked the CSS: `.hero-section` has `justify-items: center`
   and `.scroll-indicator` has `flex; align-items: center` at every `≤1024px`
   width — no centering bug found in the code. Needs a screenshot or specific
   device/width before touching anything further.

## Gotchas worth keeping if picking this up cold

- **Browser automation can't reach `localhost` in this environment.**
  `chrome-error://chromewebdata/` despite `curl` returning 200 on the identical
  URL, confirmed repeatedly across two sessions. All verification since has
  been source-level (geometry math, cascade tracing, logical review), not live
  capture. Fix this or find another viewing method before trusting any future
  "visually verified" claim at face value.
- **`spectra-sync-specs` doesn't exist on this machine** despite being
  referenced by `spectra-archive`'s `SKILL.md`. Every archive so far synced
  specs by hand: write `openspec/specs/<capability>/spec.md` from the change's
  delta (new capability needs a full Purpose+Requirements doc; existing one
  needs the delta merged in, watching for multiple changes touching the same
  capability), then `spectra archive <name> --skip-specs`.
- **`.spectra/touched/<name>.json` is unreliable for `/spectra-commit`** in
  this repo — it picks up hundreds of unrelated pre-existing untracked files
  rather than just what a task touched. Stage from `git status` directly
  instead of trusting that file.
- **`spectra park`/`unpark` moves change files into `.git/spectra-app/changes/<name>/`**
  — invisible to normal `ls`/`git status` but not lost; confirm with
  `spectra list --parked --json`.
- **Always trace the actual CSS cascade winner, not the first-declared rule.**
  The Ch3 sticky-box centering fix only worked because a later, unconditional,
  `!important` rule was the real winner at every breakpoint — found by grepping
  every occurrence of the selector, not by reading top-to-bottom.
- **Verify arithmetic with concrete numbers before shipping a "reserved margin"
  fix.** One of this session's own `design.md` files said to *subtract* an
  offset where the math actually required *adding* it — caught by working
  through real numbers, not by trusting the design doc's prose.

## How to test

```
cd 115MoneyDemoB-main && python3 -m http.server 8001
```
Open `http://localhost:8001/index-v2.html` (works over plain HTTP `curl`, but
not from this session's Chrome-extension automation — see Gotchas above). For
phone testing, bind to `0.0.0.0` and use the machine's LAN IP. The seven-viewport
matrix used across all changes: 390×844, 430×932, 768×1024, 820×1180, 1024×768,
1366×768, 1440×900.

## Related

See `HANDOFF.md` for the (separate, committed) `index.html` perf +
newsprint-identity work, and `LEARNINGS.md` for architecture gotchas that
mostly still apply to the "rebuilt" chapter classes shared by both files
(`.gantt-fixed-stage-rebuilt`, `.gantt-sticky-box-rebuilt`, the
absolutely-positioned Gantt frame, the two different step-trigger mechanisms
for Chapter 2 vs. Chapter 3). See `ISSUE-TRIAGE-v2.md` for the full triage
table with exact line citations for every item above.
