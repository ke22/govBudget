# Handoff — `index-v2.html` / `database-v2.html` (the "-v2" workstream)

_Last updated: 2026-07-29 · Branch: `main`（頁尾工作已合併，分支已刪）_

## What this is

`index-v2.html` and `database-v2.html` are **duplicate copies** of the live
`index.html` / `database.html`, created by Spectra change `polish-index-database-v2`
so rounds of user-reported fixes could be iterated on without touching the
production pages. This is a **separate file** from `115MoneyDemoB-main/index.html`
— see `HANDOFF.md` / `LEARNINGS.md` for that page's own (committed) perf +
newsprint-identity history. Nothing in this document affects the live
`index.html`/`database.html`.

## ⚠️ OPEN ACTIONS as of 2026-07-23

1. **Another Claude Code session is concurrently editing this same file** (and
   `database.html`/`database-v2.html`) **on the same branch, in the same local
   checkout.** Confirmed twice this session: the Edit tool warned the file had
   changed on disk between reads, and a full commit (`295ed63 style(database):
   adopt index-v2's fluid type-scale tokens, sync pie chart palette`) appeared
   on `optimize-index-frontend-perf` that this session never authored. As of
   this writing their in-progress (uncommitted) work touches `.hero-headline-panel`
   and `.scroll-indicator` mobile positioning (grid-based → `position:absolute`
   centered) and removes a chunk of Chapter 2/3 "flatten on compact mobile"
   CSS (`#chapter-2-rebuilt`, `.gantt-fixed-stage-rebuilt`, `.gantt-card-rebuilt`
   `min-height:auto` overrides) in favor of keeping the pinned/scroll-linked
   mechanism at every width. **Do not blindly `git add` the whole file** — diff
   first and stage only your own hunks (see Gotchas below for the exact
   technique used this session).
2. **2026-07-22 optimize pass's scroll-hot-path trims** (commit `2168b29`,
   committed, live for a while now with no regressions reported) and the
   **Chapter 1 node+card fade unification** (item below, now committed via
   `8f48a99` and deployed to both `index.html` and `index-v2.html`) are both
   still nominally "verified via source-level review, not a live scroll-test"
   per this environment's standing limitation (see Gotchas). No issues have
   surfaced from real usage since, but a real scroll-through is still the
   better bar if this environment's browser automation ever starts reaching
   `localhost`.

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

## 2026-07-23 `fix-timeline-chart-polish` ported to `index.html`, then a follow-up polish pass on `index-v2.html`

A separate Spectra change, `fix-timeline-chart-polish`, was created (by another
AI tool, "antigravity") and applied via `/spectra-apply` in this session to
port `index-v2.html`'s already-working features into the **live**
`115MoneyDemoB-main/index.html` (10 tasks, all shipped, archived under
`openspec/changes/archive/2026-07-22-fix-timeline-chart-polish/`). See
`HANDOFF-FIX-TIMELINE-CHART-POLISH.md` for that change's own detail. Two
things from that work matter here because they also apply to (or were then
extended into) this file:

**A real bug shipped and then fixed in both files: the pyramid chart
(718億先行動支方案) went permanently invisible after its entrance-animation
was added.** `.dynamic-chart-box`'s base rule forces `visibility: hidden
!important`. The new `#ch4-pyramid` / `#ch4-pyramid.visible-box` override
(added to give the chart its own scroll-triggered fade-in, independent of the
already-broken `is-active-chapter`/`dashBox`/`rank1Box`/`rank2Box` wiring —
see below) only touched `opacity`/`transform`, never declared `visibility` at
all — so the base class's `!important` won regardless of the `.visible-box`
class or opacity reaching 1. The chart kept its layout space (not
`display:none`) but rendered nothing, which is exactly why it read as "the
chart disappeared" rather than "the layout broke." Fix: both selectors now
also set `visibility: hidden !important` / `visibility: visible !important`
respectively, mirroring the pattern the base `.dynamic-chart-box` /
`.is-active-chapter .dynamic-chart-box.visible-box` pair already uses.
**Lesson: when a new override rule is meant to defeat a base rule's
`!important`, audit the base rule property-by-property — it's not enough to
override the properties you're consciously changing (opacity, transform);
you must also override every property the base rule marks `!important`, even
ones you don't think you're touching.**

**Pre-existing, separate dead code found and deliberately left alone (in
both files):** the Chapter 4 IntersectionObserver branch that's supposed to
toggle `.visible-box` on `#ch4-pyramid`/`#ch4-ranking-1`/`#ch4-ranking-2` via
`document.getElementById(...)` can never run — those three ids don't exist
anywhere in either file's HTML, and `#chapter-4` has zero `.step-scene` /
`.gantt-card-rebuilt` / `.gantt-trigger-scene` / `[data-bg]` elements for the
shared `IntersectionObserver` to ever observe in the first place. This is not
something lost during porting; it never worked in either file. The new
pyramid-chart entrance animation is a **self-contained** `IntersectionObserver`
scoped only to `#ch4-pyramid`, added specifically so it doesn't need to repair
(or risk breaking) that separate, unrelated, already-broken mechanism.

**Follow-up polish requested directly against `index-v2.html`** after the
port (none of this touched `index.html` except where noted):
- Chapter 2's Gantt-chart axis and the red-line/gray deadline-zone block used
  to wait for the whole-chapter scroll-percentage thresholds (20%/40%) before
  appearing — often visibly late relative to when the corresponding card's
  text had already scrolled into the readable zone. Fixed by adding an
  early-trigger check: as soon as card 2's (or card 4's) own `.story-card`
  crosses 50% of viewport height, force-add `rebuilt-step-2` (or `-4`) even
  if `currentStep` hasn't caught up yet — guarded to only fire while
  `currentStep <= 6` so it can never re-trigger once the reader has moved
  into the cards 7-9 photo section, which is also what keeps this from
  bleeding into Chapter 3.
- The final history card's (card 9, the 唐飛/劉兆玄/林全 photo) text was
  fading out too early relative to how long it takes to actually read it.
  `updateHistoryExit()`'s thresholds moved from `viewportHeight * 0.55` (fade
  start) / `0.35` (fully transparent) to `0.40` / `0.20` — same 0.2 fade
  width, just delayed. The reduced-motion binary threshold moved proportionally
  (0.45 → 0.30).
- Terminus mark (the circular badge at the end of the Chapter 1 red line)
  **no longer switches to a "↓" arrow at 100% completion** — it was
  originally designed (in an earlier session) to pulse "?" while incomplete
  and swap to a static "↓" once the line finished. Several rounds of
  "why does it show the arrow immediately" bug reports turned out not to be a
  bug at all — the calculation was correct (verified: the arrow only ever
  appeared where `percent` genuinely reached 100, confirmed against the file's
  own last row in the DOM) — the user simply never wanted the arrow-swap
  feature in the first place. Removed the `classList.toggle('timeline-complete', ...)`
  call and the now-dead `.timeline-complete` CSS rules entirely; the mark just
  pulses "?" forever now. **Lesson: a "bug report" that survives every
  diagnostic you throw at it (console snippets, incognito tests, screenshot
  requests) can be a disguised design-change request in disguise, not an
  actual defect** — worth explicitly asking "do you want this to ever look
  different, or should it just never do the thing you're describing" earlier
  in the loop, rather than continuing to hunt for a bug that isn't there.
- CTA button (`.cta-btn`) and `.footer-cta`'s background both moved off the
  low-contrast `--ui-accent`/dark-red-on-faint-gradient combination onto the
  brighter `--np-seal-red-bright` (#E2564A), then the `.footer-cta` gradient
  was further hand-tuned per exact user-supplied values (`linear-gradient(6deg,
  rgba(226, 86, 74, 0.16) 0%, #664b49 100%)`).
- `.scroll-indicator` (text + its `::after` gradient line), at every
  breakpoint (base/pc, ≤640px, ≤1024px), was explicitly changed **to**
  `#a5271e` — the same dark, lower-contrast red that earlier work
  (`primary-red-contrast-fix`) had deliberately moved *away* from elsewhere on
  this exact page for contrast reasons. Flagged the conflict once; user
  confirmed they wanted the literal value anyway. Applied as given — it's a
  small decorative indicator, not body text, and an explicit, informed
  user choice overrides a general contrast guideline for a non-critical
  decorative element.
- Hero image (`hero-collage.jpg`, desktop-only — mobile crop
  `hero-collage-mobile-clean.webp` deliberately left untouched, confirmed via
  AskUserQuestion) replaced with new artwork, twice: first exported from the
  user-supplied `.jpg`, then re-exported directly from the source `.psd` at
  the same target size (1400px wide, ~70% JPEG quality) once the `.psd` was
  made available, to avoid compounding a second lossy JPEG pass on top of
  whatever compression the `.jpg` already had. Same filename both times, so
  no HTML changes were needed — `index.html` and `index-v2.html` share this
  one file.

**Deployment mechanics learned this session:** GitHub Pages (`ke22.github.io/govBudget/`)
builds from `main`'s **own separate root-level** `index.html`/`database.html`
via a Jekyll Actions workflow (`.github/workflows/jekyll-gh-pages.yml`,
triggers only on push to `main`, `source: ./`). `115MoneyDemoB-main/index.html`
and `index-v2.html` are **not** that file and were not reachable at any URL
until this session merged the whole `optimize-index-frontend-perf` branch
into `main` — at which point Jekyll's plain static passthrough made them
browsable at `.../115MoneyDemoB-main/index.html` and
`.../115MoneyDemoB-main/index-v2.html`, alongside (not replacing) the
pre-existing root `index.html`. Every fix this session went out the same
way: commit on the feature branch → push branch → merge into `main` inside a
throwaway `git worktree` (keeps the merge from touching this session's dirty
working directory) → push `main` → `gh run list --workflow=jekyll-gh-pages.yml`
polled until `status=completed conclusion=success`.

**Working alongside a concurrent editor of the same file, this session:**
more than once, `git add <file>` would have swept up large, unrelated,
uncommitted hunks from the other session (mobile hero centering, Chapter 2/3
mobile CSS removal — see Open Actions #1). The recipe used to commit *only*
this session's own changes: `git diff -- <file> | grep '^@@'` to enumerate
hunks, identify which ones are mine by content (e.g. grep for a string unique
to my edit), slice exactly those hunks (plus the 4-line diff header) out of
the full diff with `sed -n`, then `git apply --cached <the-sliced-patch>` —
this stages precisely those hunks while leaving everything else in the
working tree (and the other session's un-committed work) completely
untouched. Confirmed correct each time by checking `git diff --cached --stat`
(should show only your own line counts) and `git diff --stat` (the remainder,
still sitting there unstaged).

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

## 2026-07-27 branding (all 4 pages) + Chapter 1 timeline preface/red-line rework, Chapter 2/3 content edits (`index-v2.html`, plus `database-v2.html`/`index.html`/`database.html` for the branding piece)

**Correction to the "Gotchas" section above: browser automation reached
`localhost` fine this session**, via the `claude-in-chrome` MCP extension
(`python3 -m http.server` + `navigate`/`javascript_tool`/`computer` screenshot
calls), across dozens of live verifications below. Whatever blocked it in the
2026-07-22/23 sessions is not reproducing now — don't assume it's still
broken; try it before falling back to source-only review.

**Header branding, shipped to all four pages (`index.html`, `database.html`,
`index-v2.html`, `database-v2.html`):**
- The CNA mark moved out of `<nav>` (where it sat to the right, next to the
  nav buttons) into a new `.brand` wrapper directly before the site title, so
  it now reads as a logo+title lockup on the left, opposite the nav on the
  right.
- Recolored to match the title exactly (`var(--np-seal-red-bright)` on
  index/database, `var(--ui-accent)` on the -v2 pages, i.e. whatever each
  page's own title color token already is) — first attempt used
  `mask-image: url('cna-logo.svg')` + `background-color`, **which silently
  fails over `file://`** (see new `LEARNINGS.md` entry #10) and was replaced
  with the icon's path data inlined directly as `fill="currentColor"` SVG
  markup in each page, colored via a plain CSS `color` property. No external
  fetch, so it's identical under `file://`, a dev server, or GitHub Pages.
  Enlarged from 22px to 32px on the two `-v2` pages per follow-up request
  (`index.html`/`database.html` left at 22px, not asked to change).
- Restored `cna-favicon-adaptive.svg` (existed in git history, had been
  deleted) using the new mark's path data, `prefers-color-scheme`-aware
  (`#4a4a4a` light / `#EDE6D3` dark, matching the pre-existing color choice).
  `cna-favicon-light.svg` is now unreferenced anywhere (nothing loads it) —
  left deleted.

**Chapter 1 timeline (`index-v2.html` only), several rounds of direct user
iteration — final state:**
- A new lead-in sentence — "行政院依審議時程函請，為什麼立委不願配合安排審議，
  要從軍警待遇修法說起。" — sits above the dated timeline as
  `.timeline-block-node.node-preface`: no background fill, no border, text
  color inverted to `var(--ui-ink-inverse)` (confirmed via an
  AskUserQuestion wireframe preview — borderless was the explicit pick over a
  thin-bordered variant). It sits **outside** the scroll-reveal system
  entirely (forced `opacity:1 !important`) rather than being wired into it,
  because of the next point.
- **The line/terminus/dated-rows got split into a new `.timeline-spine`
  wrapper**, separate from the preface row, so the red progress line's
  `top:0` starts at the *spine's* top (right below the preface) instead of
  the whole container's top (which used to run the line up through/behind
  the preface text — not wanted). `updateTimelineMainLineFill()`'s `rect`
  source moved from `#center-timeline-container` to `#timeline-spine`
  accordingly; the per-row `querySelectorAll` inside it is now implicitly
  scoped to real rows only (preface is a sibling outside the spine, so it's
  never selected — consistent with forcing it always-visible above).
- Then reversed part of that on request: the outer container's `gap`
  (previously 40px/25px, and since the container now has exactly 2 flex
  children — preface + spine — this gap was scoped only to that one seam)
  was shrunk to 8px, and a new empty `.timeline-lead-in` (60px) spacer was
  added as the spine's first flex child, so the animated fill — not a static
  dim guide-line — visibly draws continuously from right under the preface
  circle, through ~100px of runway, into the first dated card. (User was
  offered both a "static dim connector" and "the real animated fill extends"
  option via CLI wireframe; picked the latter.)
- Reveal trigger simplified: `fillTipViewportY >= rowRect.top + 40` → `>=
  rowRect.top` (no lead) per direct request — each node/card now fades in
  the instant the line's tip reaches its own top edge, not 40px early.
- Added a hand-drawn "doodle circle" around the preface sentence: inline
  `<svg class="node-preface-doodle">`, an intentionally-open oval path (ends
  don't meet, picked over a fully-closed "highlighter" variant via wireframe),
  stroke-only in `var(--np-seal-red-bright)`, sized via `calc(100% + Npx)` off
  the parent box (not fixed px) so it reflows correctly at any text-wrap
  height/width without a mobile media query. Then animated: `stroke-dasharray:
  700` / `stroke-dashoffset: 700→0` over 1.1s via a `.doodle-drawn` class
  added by a one-shot `IntersectionObserver` (40% threshold, disconnects
  after firing) — plays once when scrolled into view, not on page load
  (would already be finished by the time the reader actually scrolls there).
- Terminus mark ("?" circle at the timeline's end) was sitting flush against
  the last card — `.timeline-spine` had no `padding-bottom`, so the mark's
  `bottom:0` anchor was exactly at the last row's bottom edge. Fixed with
  `padding-bottom: 50px` on `.timeline-spine`.
- Moved the "立法院分別在114年1月7日...軍人薪資及加給" story-card from after
  both the 01/07 and 06/10 nodes to between them (chronological placement
  fix), and corrected a caption typo (佔據→占據) in the chapter-2 history
  photo caption.

**Chapter 2 Gantt chart (`index-v2.html` only):** removed the 115年 row (both
its `.gantt-bar-115-rebuilt` bar and its `year-115-label` y-axis tick) —
applies to mobile and desktop since it's one shared, CSS-reflowed DOM, no
separate mobile markup. Cleaned up the now-dead `.gantt-bar-115-rebuilt` CSS
rule.

**Chapter 3 bar chart (`index-v2.html` only):** 新興計畫/延續計畫增額 bar +
legend colors moved off green/blue (`#6FAE85`/`#7CA2D6`) onto new dedicated
`--chart-cat-ch3-new` (terracotta `#C9763A`) / `--chart-cat-ch3-extend` (plum
`#9C5B86`) tokens — **not** by changing the existing `--chart-cat-new`/
`--chart-cat-extend` vars, because those are also reused by Chapter 2's
`.party-dpp`/`.party-kmt` Gantt bars for real-world DPP-green/KMT-blue party
coding, which needed to stay untouched. Verified via `getComputedStyle` that
the party bars are still exactly `rgb(111,174,133)`/`rgb(124,162,214)` after
the change.

**Branch note:** this session worked on `adjust-hero-images` (branched off
`optimize-index-frontend-perf`), not `optimize-index-frontend-perf` directly
— the branch line at the top of this doc predates this session and may need
reconciling once this branch merges.

## 2026-07-28 `.hero-dek-panel` desktop gap: fixed px → percentage (`index-v2.html` only)

New branch `chapter-2-v2` (branched off `adjust-hero-images` after PR #1). Small,
single-property change, went through Plan Mode + an AskUserQuestion round
(both answers logged below) before shipping.

**The ask:** user pasted a devtools snapshot showing `.hero-dek-panel { bottom:
290px }` and asked whether the gap to "the title" could stay stable on PC.
**Investigated first, because the premise needed checking:** the on-disk value
was `bottom: 160px`, not `290px` — confirmed via AskUserQuestion this was a
devtools value the user had already tried and wanted adopted, not a stale
paste from elsewhere. More importantly: **on desktop `> 1024px`, `.hero-title`
is `.hero-sr-only` (screen-reader-only) — the title text visitors actually
see is baked into `hero-collage-v2.jpg`'s pixels, not a real DOM element.**
`background-size: 100% auto` scales that image by the section's **width**;
`overflow:hidden` + `background-position: center center` then crops it
against the section's **height**. `.hero-dek-panel`'s fixed `bottom: Npx` is
anchored to the section's bottom edge — an axis unrelated to where the
baked-in title actually lands on screen — so the visual gap drifts as
viewport *height* changes, independent of width.

**Two real options, both put to the user via AskUserQuestion with CLI-wireframe
previews rather than assumed:**
1. Lock the background image to a fixed-aspect container (`aspect-ratio` +
   `object-fit`-style sizing) so the baked-in title's on-screen position
   becomes computable and the panel could anchor to it precisely. Rejected —
   too large a change for what's still a decorative hero image, would touch
   existing crop/fill behavior.
2. **Chosen:** convert `.hero-dek-panel`'s `bottom` from a fixed px value to a
   **percentage of `.hero-section`'s own height** (`bottom: 35.5%`, calibrated
   so it reproduces ≈290px at a 900px-tall viewport: `290 / (900 - 83px
   header) ≈ 35.5%`). This is an **approximation, not a physically exact
   lock to the image content** — explicitly accepted by the user as the
   tradeoff for not doing option 1. The 900px reference height is this
   session's own assumption (matches earlier 1440×900 test viewports used
   in this session), flagged to the user as adjustable if their actual test
   window differs.
- Scope: **desktop rule only** (the base `.hero-dek-panel` rule, ~line 210).
  The `≤1024px` block (~line 3510) already switches this element to
  `position: static` inside `.hero-headline-panel`'s flex card — where the
  title *is* a real, visible element and the gap is already a proper flex
  `gap`, not a positioning hack — left untouched.
- Verified via `getComputedStyle`: at the actual test tab's 1920×958 window,
  computed `bottom` resolved to `310.6px`, matching `35.5% × (958 - 83)`
  exactly — confirms the percentage scales as intended rather than silently
  behaving like a fixed value.

**Concurrent-editor note, same as before:** `HANDOFF-v2.md` and `index-v2.html`
both had pre-existing uncommitted hunks from another session when this work
started (a `hero-collage.jpg` → `hero-collage-v2.jpg` swap + a story-card
mobile font-size rule in `index-v2.html`; the same 2026-07-22/23 "Open
Actions"/`fix-timeline-chart-polish` hunks as before in this file). Edited
around them without touching their hunks; this doc entry is staged the same
sliced-hunk way described in Gotchas.

## 2026-07-28 `.scroll-indicator` recolored red → beige + drop shadow, both breakpoints (`index-v2.html` only)

Branch `adjust-hero-images` (current checkout). User request: change
`.scroll-indicator` ("向下捲動探索") to beige on both PC and mobile, and add a
shadow so it still reads clearly against the busy hero photo now that it's no
longer a saturated color.

**This reverses an explicit, previously-logged decision.** The 2026-07-23
entry above (line ~259) records that `.scroll-indicator` was deliberately set
to `#a5271e` at every breakpoint at the user's explicit confirmation, even
after being flagged as lower-contrast than `primary-red-contrast-fix`'s
guidance elsewhere on the page — because it's "a small decorative indicator,
not body text." Today's ask supersedes that: color is now
`var(--ui-ink-inverse)` (`#EDE6D3`, the same beige/cream token used for
inverse-ink text elsewhere on the page) on **both** the base/PC rule (~line
349) and the `≤1024px` mobile override (~line 3525) — mobile was already this
color before today (only PC was still red), so mobile's change here is
additive (shadow only), PC's is the color swap.

- Added `text-shadow: 0 1px 3px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35)` to
  the `.scroll-indicator` text at both breakpoints, and
  `filter: drop-shadow(0 1px 3px rgba(0,0,0,.5))` on the `::after` vertical
  line at both breakpoints — same shadow values reused in all four spots so
  the treatment reads as one consistent style, not four independent tweaks.
- Rationale for needing a shadow at all: beige (`#EDE6D3`) sits close in
  luminance to parts of `hero-collage-v2.jpg` (a photo collage, not a flat
  background), so without a shadow the indicator can wash out against lighter
  regions of the image depending on scroll/crop. The drop shadow anchors it
  regardless of what's directly behind it at a given viewport.
- Not yet live-screenshotted (this environment's standing `localhost`
  browser-automation limitation, see Gotchas) — verified by reading the
  computed values only. Worth a real visual pass against the actual hero
  photo before merging, specifically checking the indicator over the
  photo's lighter regions.

## 2026-07-28 第二章結尾節拍重排：文字先、圖片3後（`index.html` + 根目錄 `index.html`）

分支 `chapter-2-refine`（從 `main` 開出），4 個 commit：`7660d0c` → `eff1b47`
→ `1ad847e` → `90a9a98`。改的是**正式版** `115MoneyDemoB-main/index.html`，並同步
到根目錄 `index.html`（GitHub Pages 實際發布的檔案，兩份保持 byte-identical）。

### 需求

使用者提供第二章分鏡逐格對照，唯一與現況不符的是最後一格：
「第二章最尾端，出完兩張 96 年照片後**先出文字方塊，再出現圖片**」。
其餘內容（步驟 1–9、101/105/113 年度與 96 年度的 bar highlight、紅色虛線、
淺灰執行區、兩張 96 年照片、89 年唐飛/張俊雄結語文字＋第三張照片）都已存在。

### 原本行為（錯的）

第三張照片（`budget003.jpg`，唐飛/劉兆玄/林全 3 個大頭照）先淡入，字卡靠
`armStep9CardReveal()` 等照片的 `transitionend` 才進場——順序剛好相反。

### 最終行為（`90a9a98`）

```
step 7  圖片1（圍主席台）
step 8  圖片1 淡出 → 圖片2（舉牌）
step 9  圖片2 淡出 → 字卡「至於預算全數退回重編…」單獨淡入（左側留空）
        ↓ 字卡實際捲出視野（bottom <= 0.35vh）
        圖片3（3個大頭照）淡入，單獨佔畫面 ≈0.77 個畫面高
        ↓ 跑道跑完（runwayBottom / chapter3Top 降到 0.95vh）
        舞台淡出 → history-exit-complete
        ↓
        第三章開場文字淡入（晚審影響／新興預算無法動支）→ 第三章圖表
```

### 三次修正的過程（重要：前兩次都不夠，別只讀第一個 commit）

1. `7660d0c` 單純把兩者的 gating 對調（字卡改由 `.is-active` 直接淡入，圖片3
   改等新的 `.history-text-settled`，由字卡的 `transitionend` 補上）。
   **不夠**：`transitionend` 只等 0.4s，字卡與圖片3實際上仍幾乎同時停在畫面上，
   不是使用者要的「字卡先捲走」。
2. `eff1b47` 把 `.history-text-settled` 改成**每幀依字卡實際捲動位置**判斷
   （`bottom <= 0.35vh`），捲上捲下都會正確切換。
   **仍然壞掉，而且更嚴重——圖片3完全不出現**：第二章的退場淡出本來就錨定在
   同一張字卡上，`top <= 0.20vh` 就已 `visibility:hidden` 收完，比「字卡捲出視野」
   更早成立。字卡是章節最後一個元素，它捲走的同時章節就結束，中間**沒有任何
   捲動距離**留給圖片3。
3. `1ad847e` 補上捲動跑道 `#ch2-final-runway` 並把退場錨點改到跑道底緣。
4. `90a9a98` 修跨章節迴歸：第三章開場文字整段空白飄過。詳見下節。

### `90a9a98` 修的跨章節迴歸（最容易再犯的一個）

`1ad847e` 之後桌機看起來對了，但使用者回報「img3 之後緊接第三章圖表，中間留空
才捲出 intro」。成因是**第三章開場文字的淡入掛在第二章的退場完成訊號上**
（`chapter3Intro.classList.toggle('chapter3-intro-revealed', stage.classList.contains('history-exit-complete'))`），
而**跑道底緣就等於第三章頂端**（實測 `runwayBottom === chapter3Top`）。退場門檻
一改，等於同時把第三章開場文字往後推到 `chapter3Top ≈ 171px` 才解鎖，此時它只剩
191px 就要捲出畫面上緣，0.5s 淡入跑不完 → 讀者只看到空白。

解法是把兩件事拆成互相獨立的旋鈕：

| 旋鈕 | 位置 | 只負責 |
|---|---|---|
| `.ch2-final-runway` 的 `height`（`105svh`） | CSS | 圖片3單獨停留多久 |
| `updateHistoryExit` 的 `start`/`end`（`0.95`/`0.70` 視窗高） | JS | 舞台相對第三章何時退場 |

調其中一個不會動到另一個。實測數字：圖片3單獨 675px（0.77 畫面高）；第三章開場
文字解鎖時 `introTop=624`（0.71 畫面高的淡入餘裕），修正前只有 191px（0.22）。

### 實作細節與踩過的坑

- 跑道**刻意不是** `.gantt-card-rebuilt`：否則會被手機版步驟判斷
  （`cards.forEach`）當成第 10 張卡片，也會被 `scenes` 的 `IntersectionObserver`
  抓去輪替 `is-active`。用獨立 class + `aria-hidden="true"`。
- 桌機步驟是**整章捲動百分比**制（`20/30/…/84%`），章節一變高門檻就整批位移。
  已把跑道高度從除數扣掉（`rect.height - runwayHeight - innerHeight`），讓原門檻
  維持原語意；跑道區間內 `scrollPercent` 會超過 100，由最後的 `else` 收成 step 9。
- 桌機原本的硬退場門檻 `chapter3Top <= viewportHeight` 必須改成 `chapter3Top <= 0`
  （與手機一致）。因為跑道底緣等於第三章頂端，這條門檻會比淡出區間**更早**成立，
  一露頭就把舞台瞬間關掉、跑道等於白做。現在它只是大跳躍時的保險。
- 手機／桌機的 `start`/`end` 拆分已取消（原 `0.10`/`-0.15` vs `0.40`/`0.20`）。
  錨點統一成跑道底緣後，當初分開調校的理由（錨點不同）不再成立；且錨點等於
  `chapter3Top` 時**負數終點永遠構不到**（`chapter3Top <= 0` 的保險會先把
  `progress` 壓成 1，淡出變成瞬間跳掉）。手機與桌機的實際差異（translateY 位移
  vs opacity 淡出）在下方的 `if (isMobileExit)` 分支，不在觸發時機。
- `armStep9CardReveal()` / `armStep9ImageReveal()` 這類「亮起後定時解鎖」的
  一次性機制已全部移除，改為每幀依位置判斷，倒捲時狀態才會正確還原。

### ⚠️ 未驗證：手機版

桌機（1478×879 / 1920×958）已用捲動掃描＋截圖驗證。**手機版完全沒量到**——
這個環境的 `resize_window` 改不動 layout viewport（`outerWidth` 變了但
`innerWidth` 仍是 1920、`matchMedia('(max-width:1024px)')` 仍 `false`）。
手機的改動（共用 `start`/`end`、跑道、gate 門檻）都是從「`runwayBottom ===
chapter3Top`」這個已量測到的幾何推導出來的，但**合併前值得在真機上看一次**，
重點看三件事：
1. 圖片3有沒有在字卡捲走後單獨出現（手機是頂部固定帶狀區，字卡是往帶狀區後方捲走）；
2. 帶狀區的 translateY 退場有沒有變得太突然；
3. 第三章開場文字有沒有正常淡入。

### 順帶修正舊紀錄：`localhost` 瀏覽器自動化其實可用

前一則（`.scroll-indicator`）寫的「standing `localhost` browser-automation
limitation」需要修正：`file://` 確實被擋，但 `python3 -m http.server 8777` +
`http://localhost:8777/index.html` **可以正常導航、執行 JS、截圖**，本次就是這樣
驗證的。真正的陷阱是**分頁被節流時量到的數字會安靜地錯**——`rAF` 不觸發（捲動
處理器根本沒跑，得直接呼叫 `onScrollFrame()`）、CSS transition 不前進、
`getComputedStyle` 回傳過期值（實測出現過三個相框的 opacity 與 cascade
**完全相反**的殘影）。可信的只有「DOM class / JS 寫的 inline 值」與「截圖」。
詳見 `LEARNINGS.md` 第 14 條。

### 如何驗證（桌機）

```js
// 在 http://localhost:8777/index.html 的 console
const ch2 = document.getElementById('chapter-2-rebuilt');
const ch2Doc = ch2.getBoundingClientRect().top + scrollY;
for (let rel = 6500; rel <= 9800; rel += 25) {
  scrollTo(0, ch2Doc + rel);
  onScrollFrame();                      // rAF 節流的分頁不會自己跑，必須手動呼叫
  // 讀 ch2.classList / stage.style.getPropertyValue('--history-exit-opacity')
}
```
關鍵門檻（1478×879）：圖片3解鎖 `rel=7575`、退場開始 `8250`、退場完成＋第三章
開場文字解鎖 `8475`。

## 2026-07-29 頁尾製作資訊（`index.html` + `database.html`，含根目錄兩份）— 已合併進 `main`

_合併：PR #4（`e673aad`）＋ PR #5（`07fb514`）。分支 `footer-dates-and-credits` 已刪除。_

### 需求演進（**依時間序，後面推翻前面，別只讀第一條**）

1. 「footer 壓製作日期跟更新日期，未來如果有更新，更新日期要再改／footer 預留空間放 credit 製作人員。」
2. `database.html` 也要有一樣的頁尾。
3. `.footer-dates` 在手機要**一行**。
4. **最終**：「pc 跟 mobile 都不用製作日期」，並給出真名單。

第 4 點同時把第 1 點的「製作日期」需求收回，也把暫定的職稱整組換掉
（記者／資料整理／網頁設計／前端開發，4 列 → 監製／製作統籌／攝影／網頁設計／網頁工程，5 列）。
**這不是把名字填進原本的欄位，是整份名單換掉。**

### 最終長相（兩頁完全一致）

```
                  製作團隊
        ─────────────────────────
        監　　製   葉純豪
        製作統籌   王柔婷
        攝　　影   裴禛
        網頁設計   劉姿嘉
        網頁工程   陳玟憲

           更新日期 2026-07-28

     copyright © 2026 中央通訊社版權所有
```

### 未來要更新「更新日期」時，每頁要改**三處**

以 `index.html` 為例（`database.html` 同理，行號見各檔案內註解）：

| 位置 | 內容 |
|---|---|
| `<p class="footer-dates">` 裡的 `<time>` | `datetime` 屬性**與**畫面文字兩個都要改 |
| JSON-LD 的 `"dateModified"` | 結構化資料，畫面上看不到 |
| （不用動）JSON-LD 的 `"datePublished"` | 見下節 |

三處漏一處不會有任何錯誤訊息，畫面也看起來正常——只有搜尋引擎拿到的日期會不一致。
`index.html` 的 `<footer>` 上方已留了說明註解列出這三處。

### `datePublished` 刻意保留（**別當成漏改**）

使用者說的是「畫面上不要製作日期」。`datePublished` 是**不顯示的結構化資料**，
而 Google 對 `NewsArticle` 這個 type 要求要有它，拿掉只會讓搜尋 metadata 變差、
對「畫面不要顯示」這個需求沒有任何幫助。所以：畫面上的 `製作日期` span 整段刪掉，
JSON-LD 的 `datePublished` 留著，並在該處寫了註解說明這是刻意的。
`index.html` 是 `NewsArticle`、`database.html` 是 `WebPage`，兩者都有加
`datePublished`/`dateModified`。

已向使用者揭露此判斷、使用者未要求移除。若日後要拿掉，兩頁各一行。

### 實作細節與踩過的坑

- **`database.html` 不能直接貼 `index.html` 的 CSS。** 兩頁的設計 token 命名不同，
  貼過去會**安靜地**變成沒有顏色的裸文字（`var()` 找不到就當沒宣告）。對應關係：

  | `index.html` | `database.html` | 實際色值 |
  |---|---|---|
  | `--ui-muted` | `--np-muted-ondark` | `#A79C8C` |
  | `--ui-ink-inverse` | `--np-text-ondark` | `#EDE6D3` |
  | `--font-body` / `--type-caption` | 同名 | — |

  底色 `#1E1410` 與分隔線的 `rgba(237,230,211,…)` 是**寫死的字面值**，兩頁共用沒問題。

- **`.footer-credits-title::after { display: none }` 只有 `index.html` 需要。**
  `index.html` 有一條全域 `h2::after`（52×6px、`var(--ui-accent)` 朱紅裝飾線）是給章節
  大標用的，會漏到頁尾小標題上，和標題下方那條細分隔線疊成雙線。`database.html` 的
  `h1,h2,h3` 規則只設 `font-family`，沒有這個問題，所以**刻意沒有**加這條覆蓋——
  不是漏抄。

- **`database.html` 的頁尾原本就有一個既有 bug，順手修掉了**：它的 `.page-footer`
  背景用 `var(--bg-color)`，跟 body 底色（`#12191A`）是同一個值，等於頁尾跟內文之間
  完全沒有視覺邊界。這正是 `index.html` 當初改用 `#1E1410` 要解決的問題。

- **兩字職稱對齊四字**用 `text-align: justify` + `text-align-last: justify`，
  不是手動補全形空白。五個職稱都解析成 56px 寬。**只加 `text-align-last` 不夠**，
  單行文字要兩端對齊，`text-align: justify` 也要一起給。

- **`dt`/`dd` 直接當 grid 子項**（`dl` 下直接放 `dt`/`dd` 是合法 HTML5），不用
  `<div>` 包裝 + `display: contents`——少一層、也少一個無障礙樹的變數。

- **`.footer-dates` 的 flex 換行看的是容器寬度、不是視窗寬度**，所以「手機一行」
  不能靠改視窗大小測（這個環境也改不動 layout viewport，見 `LEARNINGS.md` 第 14 條）。
  當時是用隱藏探針量文字實寬（12px 下需 260px、320px 視窗有 280px 可用），再把容器
  寬度綁死來測換行行為。**現在只剩「更新日期」一段，這個限制已經不緊了**，但 flex
  置中的結構刻意留著，日後要加回第二段日期不必重寫版型。

### 四份檔案必須同步

`index.html` / `database.html` 在**根目錄**和 `115MoneyDemoB-main/` 各有一份，
GitHub Pages 是從 **repo 根目錄** build 的，所以根目錄那兩份才是真正上線的檔案。
每次改頁尾都是動四個檔案。合併後已驗證兩組 byte-identical：

```sh
cmp index.html 115MoneyDemoB-main/index.html && cmp database.html 115MoneyDemoB-main/database.html
```

## 2026-07-29 第三章：查核storyboard，**未改任何程式碼**

使用者開了 `chapter-3` 分支並給了第三章分鏡，明確限制「新興計畫的 bar **不要用綠色**」、
「延續計畫增額的 bar **不要用藍色**」。逐項比對後，**現況已經全部符合分鏡**——文字、
顏色、幾何、步驟觸發時機都對，所以這次**沒有做任何修改**，不要去翻 diff 找。

### ⚠️ class 名稱會誤導人（唯一值得處理的事）

| 識別字 | 名稱暗示 | 實際 render 出來的顏色 |
|---|---|---|
| `.ch3-color-teal` / `#ch3-bar-new-teal`（新興計畫） | 綠 | **赭紅 `#C9763A`**（`--chart-cat-ch3-new`） |
| `.ch3-color-blue` / `#ch3-bar-extend-blue`（延續計畫） | 藍 | **紫藕 `#9C5B86`**（`--chart-cat-ch3-extend`） |

名稱是舊配色留下來的，跟使用者「不要綠、不要藍」的要求**字面上完全相反**。
風險是日後有人（或某個 agent）看到 `teal`/`blue` 以為是壞掉了而「修」回綠藍，
直接違反明確需求。共 13 處，純機械改名（`index.html` 1665/1670 的 class 定義、
1712–1743 與 1825–1826 與 3844–3856 的選擇器、4433–4434 的 markup）。

**已向使用者提出、使用者尚未要求執行。** 若不改名，至少別把這兩個名字當成配色依據。

### 步驟寬度（比對分鏡用）

`ch3-step-1` → `100%`、`ch3-step-2` → `9.8%`、`ch3-step-3` → `34%`、
`ch3-step-4` → `94.3%`、`ch3-step-5` → `100%`。第三章用的是**卡片位置**判斷
（`updateChapter3Bars`），不是第二章桌機那套整章捲動百分比。

## 2026-07-29 `design-system.html` — 設計系統文件頁（新檔案）

把散落在 `index.html` / `database.html` 的設計 token、元件與動態規範整理成一頁可互動的
文件：`design-system.html`（根目錄與 `115MoneyDemoB-main/` 各一份，同樣要保持同步）。
含 `noindex, nofollow`，不進搜尋引擎。

內容分七節：色彩（含 24 個 token 的即時對比度）、字體（clamp 實際值即時讀數）、
版型與節奏、動態（三條緩動曲線可重播）、元件（story-card／按鈕／長條／頁尾，
都是活的元件不是截圖）、跨頁 token 對映表、陷阱清單。

### 一個刻意的設計：數字全部由 JS 從 computed style 算出

色票的**色值與對比度**、字級的**實際 px**，都是頁面載入時從 `getComputedStyle` 讀出來
再算的，不是寫死在 HTML 裡。理由是文件最常見的腐爛方式就是「程式改了、文件裡的數字沒改」，
而寫死的色碼看起來跟活的一樣可信。現在只要改對這頁的 `:root`，展示區與所有數字會自己跟上。

**但 `:root` 本身仍是手抄的副本。**單一事實來源是 `index.html` / `database.html` 的
`:root`，改了那兩頁的 token，這頁要跟著改。已用腳本驗證過目前 24 個 token 與來源
**完全一致（0 個不符、0 個找不到）**，日後可以用同樣方式重驗：

```py
# 從兩邊的第一個 :root 區塊抽出 --token: value，逐一比對
import re
def root_tokens(p):
    body = re.search(r':root\s*\{(.*?)\n\s*\}', open(p, encoding='utf-8').read(), re.S).group(1)
    return dict(re.findall(r'(--[\w-]+)\s*:\s*([^;]+);', re.sub(r'/\*.*?\*/', '', body, flags=re.S)))
```

### 踩到的兩件事

- **對比度徽章不能無腦標紅**：底色類 token（`--ui-canvas`）拿去跟自己比會得到 1.0:1，
  標成 fail 會讓人以為這個底色有無障礙問題。改成 `ratio < 1.05` 時顯示「本身即此底色」。
  同時在該節說明徽章是「拿該色**當文字色**」算的，底色類標紅是正常的。
- **scroll spy 不能用「最後一筆 entry 就是答案」**：一次 callback 可能同時送來多筆
  （跳躍式捲動，或分頁被節流後補送），實測會highlight 到錯的章節。改成維護一個
  「目前有交集」的 Set，每次都從裡面取**最靠上**的那個。

### 驗證狀態

桌機 1920×958 已逐節截圖確認：色票、字級讀數、三條曲線、長條動畫、story-card 紙紋與
撕邊、頁尾 credit 對齊皆正常，console 無本頁錯誤（只有瀏覽器擴充套件的警告）。
**手機版未驗證**——這個環境改不動 layout viewport（見 `LEARNINGS.md` 第 14、18 條）。
版面全部用 auto-fit/auto-fill grid 與 `overflow-x: auto` 的表格，理論上會自然收攏，
但值得在真機看一次。

## 2026-07-29 `design-system.html` 設計品質檢視 + 修正

以「高品質網頁設計」的標準回頭檢視前一節做出來的 `design-system.html`，用量測而不是目測。
以下每一條都先量到數字才動手，修正已套用（根目錄與 `115MoneyDemoB-main/` 兩份同步）。

### 1. 中文排版：39 處多餘的字間空隙（最嚴重，且諷刺）

**問題**：原始碼裡為了不讓行太長而在句子中間換行，**漢字與漢字之間的換行會被瀏覽器
渲染成一個可見空格**。實測整頁有 39 處，例如「頁面底色深、卡片是牛皮紙色，␣強調色取自…」、
「甘特圖的␣政黨色編碼」。一個講排版的頁面自己排版有洞，說服力直接歸零。

**修正**：把漢字之間的換行全部接起來（`([CJK])\n\s+([CJK])` → `\1\2`）。
副作用是原始碼會出現長行（最長 355 字元），這是中文 HTML 的正常代價，不要為了
「行不要太長」再把句子折回去。

**⚠️ 這裡踩了一個坑，改的人務必注意**：第一輪只接漢字對漢字，還剩 8 處是換行落在
**標籤邊界**上（`…的\n<em>政黨色編碼</em>`）。補上標籤邊界的規則之後，卻**矯枉過正**——
把「漢字 + 拉丁字母／數字」之間**該有**的空隙也吃掉了，畫面上出現 `視窗713px`、
`需要時用::after`。

正確的中日文排版規則是兩條、方向相反：

| 情境 | 規則 |
|---|---|
| 漢字 ↔ 漢字 | **不留**空隙 |
| 漢字 ↔ 拉丁字母／數字 | **要留**一個空隙 |

最後補了 50 處空格回去（`--code--`／`<strong>` 內容以拉丁字元開頭或結尾時）。
現在整頁剩 1 處誤判，是 `.specimen-caption` 裡文字與按鈕之間的 flex 間隙，不影響畫面。

**還有第三條規則，補完才算完整**：全形標點（。，、；：」』）自帶視覺留白，
接在拉丁字／`</code>` 後面**不需要**再補空格，補了規則 2 的空格之後反而變成雙重間距
（`index.html</code> 。`）。實測有 18 處。收斂成「`</tag>` 後面接全形標點就不留空格」，
與規則 2 一起用才是完整的三條規則。

### 2. 字級：13 級縮到 10 級，小字區間 7 級縮到 2 級

**問題**：整頁量到 **13 個不同的 font-size**，其中 **7 個擠在 9.8px–12.5px 之間**
（0.66 / 0.68 / 0.72 / 0.78 / 0.86rem 這種各處隨手寫的值）。
一個「說明設計系統」的頁面自己不守自己的級數，是這次最傷的結構問題。

**修正**：專案本身只有 5 級，但文件頁確實需要兩個專案沒有的角色，所以**只補兩個 token**、
其餘一律收斂過去：

```css
--doc-subhead: clamp(1.3rem, calc(1.05rem + 0.5vw), 1.5rem);  /* 章節副標 h3 */
--doc-micro:   clamp(0.68rem, calc(0.64rem + 0.12vw), 0.78rem); /* 第三層小字 */
```

11 處一次性 rem 值全部改成 `var(--type-caption)` 或 `var(--doc-micro)`。
**現在整頁 0 個 `font-size: 0.__rem`**，剩下的 10 級中有 5 級是 `code { font-size: 0.94em }`
與示範區塊衍生出來的，屬於相對值不是新級數。

### 3. 階層倒掛：h3 幾乎沒有比內文大

**問題**：實測 h2 = 32px、h3 = 17px、內文 = 16.4px。h2 → h3 跳了 1.9 倍，
h3 → 內文只有 **1.04 倍**——h3 根本沒有在做階層，全靠金色在撐。

**修正**：h3 改用 `--doc-subhead`，實測 20.8px，h3/內文比值 1.04 → **1.27**。
現在是 32 / 20.8 / 16.4 / 12.2 / 11.1 的乾淨五級。

### 4. `code` 太小：最重要的內容是全頁最小的字

**問題**：`code { font-size: 0.85em }` 疊在 `--type-caption`（12.2px）上只剩 **10.4px**，
而表格裡的 **token 名稱正是讀者最需要看清楚的東西**。用縮小來表示「這是程式碼」，
在小字情境下是反效果。

**修正**：`0.85em` → `0.94em`，表格內 token 名稱 10.4px → 11.5px。
區分靠等寬字體與顏色，不靠縮小。

### 5. 版面規則寫進 HTML：4 處 inline style

**問題**：`style="margin-top:0"` × 2、`style="margin-bottom:32px"`、`style="margin-left:8px"`、
`style="padding:0;display:block"`。成因是 `.section-lede` 被同時用在**兩個不同階層**
（接在 h2 後、接在 h3 後），只好逐處補 inline 修正。

**修正**：拆成 `.section-lede`（h2 後）與 `.sub-lede`（h3 後）兩個角色；
`.table-wrap.is-spaced`、`.specimen-stage.is-flush`；說明列改用 flex `gap`。
**現在 0 個 inline style。**

### 6. 其他

- h3 間距 `40px 0 14px` → `48px 0 16px`（14 不在任何 8 的倍數上）。
- 對比度徽章 `本身即此底色` → `＝ 本身`，避免徽章寬度差太多。

### 沒有改、但知道的

- **量測環境**：這次視窗是 713px 與 980px，桌機寬版（1920px）與手機（≤414px）
  **這一輪沒有重看**。版面用的是 auto-fit grid，理論上安全，但寬版下
  `.section-lede` 限 62ch 而表格吃滿 1120px，**兩者行長差距很大**，值得再看一眼。
- 導覽列 7 個項目在 375px 需要橫向捲動（已有 `overflow-x: auto`，是刻意的）。
- 對比度全數通過（最低 4.8:1 是導覽列未選中狀態），點擊區最小 36px（略低於 44px 建議值）。

### 可重跑的檢查

```js
// 貼進 console：不該有的漢字間隙 / 該有卻沒有的漢拉間隙 / 字級數量
let a=0,b=0; document.querySelectorAll('main p, main td, main .doc-note').forEach(e=>{
  a+=(e.textContent.match(/[一-鿿]\s+[一-鿿]/g)||[]).length;
  b+=(e.textContent.match(/[一-鿿][A-Za-z0-9]|[A-Za-z0-9][一-鿿]/g)||[]).length; });
const s=new Set(); document.querySelectorAll('main *').forEach(e=>{
  if(e.textContent.trim()) s.add(parseFloat(getComputedStyle(e).fontSize).toFixed(1)); });
({strayCJKgaps:a, missingCJKLatinSpace:b, distinctSizes:s.size});  // 目標：1 / 1 / 10
```
