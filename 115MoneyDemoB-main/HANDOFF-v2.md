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

## ⚠️ OPEN ACTIONS: two unverified scroll-behavior changes stacked on this file

Neither has been scroll-tested (browser automation can't reach `localhost`
here — see Gotchas). Both need a manual forward+reverse scroll-through,
desktop and mobile widths, before being trusted:

1. **2026-07-22 optimize pass's scroll-hot-path trims** (commit `2168b29`,
   committed). Logic-equivalent by inspection. Confirm the Chapter-1 timeline
   reveal, the Chapter-2 Gantt sequence, and the Chapter-3 bar growth all
   behave exactly as before. Suspects if anything regresses: the cached
   `MQ_REDUCED`/`MQ_MOBILE` MediaQueryLists and the `timelineOnScreen` gate in
   `updateTimelineMainLineFill()`.
2. **2026-07-22 Chapter 1 node+card fade unification** (details below,
   **UNCOMMITTED**). Bigger surface than #1: item-nodes now fade in (new), the
   fade runs on mobile too for both nodes and cards (new), and the reveal
   trigger itself was rewritten from a scroll-progress-percentage comparison to
   a direct on-screen-pixel comparison (`fillTipViewportY` vs each row's own
   `getBoundingClientRect().top + 40`) after the percentage-based version
   turned out to have a real bug (see the "three iterations" writeup below —
   the visual reveal was firing near each row's center, not near its top, and
   the gap grew with how deep a row sat in the container). Confirm: (a) the red
   line's visible tip reaching ~40px above a row is what makes that row fade
   in, not some point deep inside it, (b) this holds for rows near the top of
   the timeline AND rows near the bottom equally, (c) each date node fades in
   with the same rhythm as its story card, (d) mobile now shows the fade
   instead of always-visible content, (e) reverse-scroll un-reveals nodes
   symmetrically, same as cards already do.

## 2026-07-22 review + optimize pass (shipped)

A four-lens review (performance / code-quality / accessibility / UI-UX) ran and
its **approved** fixes shipped in commits `dd4fd10`, `2168b29`, `b4bbf30`. The
biggest win: the mobile hero was a **3.6MB / 9-megapixel JPEG** served to every
phone (the mobile LCP) — re-encoded to a **559K 1200px WebP** (~85% off), original
`.jpg` kept on disk/in git and still referenced by nothing in v2. Plus dead-CSS
removal, font `preconnect` + dropped unused weight 300, image `decoding`/dimensions,
and the scroll-JS trims above. **Full record — including what was left by explicit
user choice (history photos + `paper-texture.png` still full-size ≈3MB recoverable;
charts still have no screen-reader text alternative, a real WCAG 1.1.1 gap) and the
verified NON-issues (muted-on-dark text passes AA at 6.6:1; listeners already
passive; reduced-motion comprehensive) — is in `HANDOFF-REVIEW-OPTIMIZE.md`.**
Image tooling on this machine: `sips`, `cwebp`, `avifenc`, `ffmpeg` (no imagemagick).

## 2026-07-22 Chapter 1 node+card fade unification (⚠️ UNCOMMITTED)

**Not yet committed, not yet scroll-tested.** `index-v2.html` has an uncommitted
45+/33- diff (`git diff --stat index-v2.html`) touching the Chapter 1 timeline
reveal mechanism. Summary for whoever picks this up:

**The problem (found via screenshot, not by reading code first):** the
`.item-card` story-card reveal was anchored entirely to its own geometry —
`cardRect.top - rect.top + cardRect.height * 0.45 + 40`. Because each story
card sits in the DOM *after* the 1-2 `.item-node` date blocks it explains
(separated by the container's `gap: 40px`), the red line would finish passing
both referenced dates, cross the 40px row-gap, then have to travel 45% *into*
the card's own height plus another 40px lead — before the card appeared. Net
effect: a visible "dead" scroll zone where the line had clearly finished the
narrative beat but nothing new showed up. Confirmed this holds for all 5
`.item-card` rows in the timeline (each is always immediately preceded by an
`.item-node`).

**This went through three iterations before landing on the actual root cause.
Only the last one is in the file now:**

1. *Considered, NOT shipped*: anchor the card's `cardOffset` to
   `card.previousElementSibling.getBoundingClientRect().bottom + 40` instead of
   the card's own top. Narrow, surgical, verified safe (ternary fallback to the
   card's own geometry if `previousElementSibling` is ever null), generalizes
   cleanly to all 5 cards without special-casing. This is the fix described in
   a pasted external analysis this session — that write-up is accurate as far
   as it goes, but describes a fix that was **superseded before being written**,
   not what ended up in the file.
2. *Shipped, then superseded*: the user asked for more — nodes should also
   fade in, and the whole node/card reveal mechanism should be rethought
   together rather than patched. Design at this point: both `.item-node` and
   `.item-card` rows use the identical own-geometry formula
   (`row.top + row.height * 0.45 + 40`), each toggling its own class
   (`.timeline-node-revealed` for nodes — new; `.timeline-card-revealed` for
   cards — kept separate, not unified into one class name, by explicit choice).
   This resolved the "dead zone after finishing the nodes" complaint by giving
   nodes their own delayed reveal too, instead of tying cards to the node
   before them.
3. *Shipped, then superseded again*: the user reported the reveal still
   visually fires near each row's *center*, not its top, no matter the ratio.
   Investigating turned up the actual root cause — not the ratio at all, but a
   **unit mismatch baked into the scroll-progress math from the start**:
   `percent` is computed as `scrolled / total` where
   `total = rect.height - innerHeight*0.5`, but the *visual* fill height is
   rendered as `percent% of rect.height` — a different, larger denominator
   than `total`. Since `total < rect.height` always, the on-screen fill grows
   faster than the percent-based trigger math assumes, and the gap **widens
   the deeper a row sits in the container** (verified with concrete numbers:
   for a row ~500px into a ~3000px-tall container at 800px viewport height,
   the real on-screen fill tip lands ~80-120px past where the naive formula
   thinks it is — enough to visually reach a card's center before the class
   ever toggles, regardless of whether the row-offset ratio is 0.45 or 0).
4. *Shipped (current)*: stopped comparing scroll-progress percentages
   entirely. Now computes `fillTipViewportY = rect.top + (percent/100) * rect.height`
   — the fill tip's *actual on-screen pixel position*, once per frame — and
   compares it directly against each row's own `getBoundingClientRect().top + 40`.
   Both sides of the comparison are now real viewport pixel coordinates, so
   there's no scale mismatch left to compound with row depth. Applies
   identically to `.item-node` and `.item-card` (same class-selection logic as
   step 2), at every width including mobile.

**Decisions confirmed via AskUserQuestion (all explicit user choices, not
assumptions):**
1. Nodes fade in on mobile (≤640px) too — **not** excluded like the old card
   behavior was.
2. Node-reveal class stays separate from card-reveal class (`.timeline-node-revealed`
   vs `.timeline-card-revealed`), not unified into one shared class name — lower
   risk, doesn't touch the class name already documented in the accepted spec.
3. Nodes use the same 40px lead as cards (not a separately-tuned smaller value)
   — one consistent tempo across the whole timeline.
4. Follow-up consequence surfaced and confirmed: since nodes now fade on mobile,
   **mobile cards were also switched from "always-visible, no scroll trigger"
   to scroll-triggered fade** — this *reverses* the earlier, deliberate mobile
   exclusion decision from the `chapter1-timeline-motion-choreography` /
   `fix-responsive-story-acceptance-gaps` era ("compact phone width keeps
   normal-flow cards so mobile reading order stays uninterrupted"). That
   rationale no longer applies to this file as of this change.

**Known side effect (intentional, not a regression):** the 2026-07-22 optimize
pass (`2168b29`) added a `window.innerWidth >= 641` gate specifically to skip
the expensive per-card `querySelectorAll` + `getBoundingClientRect` loop on
mobile, because mobile cards never needed live position data (they were always
visible). That gate is now **removed** — mobile runs the same per-row geometry
loop as desktop whenever Chapter 1 is on screen, because mobile now genuinely
needs it to drive its own fade-in. Worth knowing if mobile scroll perf ever
gets profiled again; this is a deliberate cost of the feature, not something
to "optimize away."

**Stale doc, not yet fixed:** `openspec/specs/chapter1-timeline-motion-choreography/spec.md`
still says the card-reveal-with-lead requirement applies "At intermediate and
wide widths" only, and says nothing about nodes. Pending user decision: quick
direct edit to the spec file, or a proper `/spectra-propose` change so this has
a tracked artifact trail instead of a silent doc patch.

**Verification done so far:** CSS brace-balance (435/435, balanced) and
`new Function()` parse check on all inline `<script>` blocks (5/5 clean) —
same discipline as every other change in this file, because browser automation
still can't reach `localhost` in this environment. **No live scroll-test yet.**
This is now the third layer of unverified scroll-behavior change stacked on
this same function this session — all the more reason it needs an actual
scroll-through before being trusted.

**Lessons worth keeping:**
- A narrow, well-verified fix (anchor-to-previous-sibling, step 1 above) can be
  completely correct and still be throwaway work if the real ask is broader.
  The tell was already there before implementing anything — the user's phrasing
  ("check all relative coding... **rethink** how to implement") signaled they
  wanted the mechanism reconsidered, not patched, even though the narrow patch
  alone would have shipped cleanly and solved the reported symptom. Read
  "rethink"/"redesign" language as a scope signal before reaching for the
  smallest fix that satisfies the literal bug report.
- When a symptom survives a targeted parameter change (steps 2→3: changing the
  ratio from 0.45 to 0 didn't fix "reveals at center, not top"), stop tuning
  parameters and re-derive the underlying math from scratch with concrete
  numbers. The bug wasn't in the ratio at all — it was a unit mismatch between
  two *different* denominators (`total` vs `rect.height`) that happened to
  look like a tunable "how far into the row" question. No amount of ratio
  adjustment could have fixed it, because the ratio wasn't where the error
  lived.

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
1366×768, 1440×900. The mobile hero is now `hero-collage-mobile-clean.webp`
(≤1024px); the original `.jpg` remains on disk but is referenced by nothing in v2.
**Priority manual check right now: the scroll-through described in the open-action
section at the top.**

## Related

See `HANDOFF.md` for the (separate, committed) `index.html` perf +
newsprint-identity work, and `LEARNINGS.md` for architecture gotchas that
mostly still apply to the "rebuilt" chapter classes shared by both files
(`.gantt-fixed-stage-rebuilt`, `.gantt-sticky-box-rebuilt`, the
absolutely-positioned Gantt frame, the two different step-trigger mechanisms
for Chapter 2 vs. Chapter 3). See `ISSUE-TRIAGE-v2.md` for the full triage
table with exact line citations for every item above, and
`HANDOFF-REVIEW-OPTIMIZE.md` for the full record of the 2026-07-22 review +
optimize pass (findings, what shipped, what was deferred by choice, verified
non-issues).
