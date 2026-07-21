# Handoff — `index-v2.html` / `database-v2.html` (the "-v2" workstream)

_Last updated: 2026-07-21 · Branch: `optimize-index-frontend-perf`_

## What this is

`index-v2.html` and `database-v2.html` are **duplicate copies** of the live
`index.html` / `database.html`, created by Spectra change `polish-index-database-v2`
so a round of user-reported fixes could be iterated on without touching the
production pages. Three formal Spectra changes and a chunk of ad-hoc (non-Spectra)
editing have since landed on `index-v2.html` specifically. `database-v2.html` only
received the one round from `polish-index-database-v2`.

This is a **separate file** from `115MoneyDemoB-main/index.html` — see `HANDOFF.md`
/ `LEARNINGS.md` for that page's (committed) perf + newsprint-identity history.
Nothing in this document affects the live `index.html`/`database.html`.

## ⚠️ Critical: this entire workstream is uncommitted and untracked

```
?? index-v2.html
?? database-v2.html
?? hero-collage-mobile-clean.jpg
```

`index-v2.html` has **never been `git add`ed, let alone committed** — three fully
completed Spectra changes (see below) plus a full session of follow-up ad-hoc edits
exist **only in the working tree**. There is no commit to `git diff` against, no
history, no recovery if the working tree is lost (e.g. `git clean`, `checkout -- .`,
disk issue). **Commit this file before doing anything destructive in this repo.**

## Spectra changes on this file (all tasks complete, none archived)

| Change | Tasks | Scope | Archived? |
|---|---|---|---|
| `polish-index-database-v2` | 23/23 | Created `-v2` duplicates; 21 reported layout/copy/interaction fixes across both pages | No |
| `stabilize-responsive-story-layout` | 13/13 | Responsive hero, editorial type/color roles, 3-tier (compact/intermediate/wide) layout+motion contract, header-aware chart clearance, Chapter 2 exit lifecycle | No |
| `refine-v2-mobile-hero-cards-axis` | 8/8 | Scroll-indicator clipping, CJK line-breaking (`line-break: strict`), mobile Ch2/3 card motion rework (pinned top band + cards flow below), Chapter-4 axis de-crowd/align | No |

All three are functionally done per their `tasks.md` checkboxes and were verified in
a prior session via browser screenshots + DOM overflow checks across a 7-viewport
matrix (390×844 up to 1440×900), forward/reverse scroll checks, and reduced-motion /
no-JS states. **None have been archived** — `openspec/specs/` has no entries yet for
any of their proposed capabilities (`responsive-editorial-hero`, `chapter-visual-exit`,
`editorial-type-and-color-hierarchy`, `chart-viewport-clearance`,
`responsive-storytelling-motion`, `mobile-scrollytelling-card-motion`,
`cjk-line-breaking`, `hero-scroll-indicator-visibility`,
`chapter4-axis-mobile-legibility`, `project-card-keyword-tags`,
`desktop-pill-row-scroll`).

Archiving was deliberately deferred once already (user chose "preview" over
"sync specs and archive" mid-session) and never revisited.

## Ad-hoc edits after `stabilize-responsive-story-layout` (not Spectra-tracked)

Done directly on `index-v2.html`, outside any change's `tasks.md`, in a separate
tool session:

- Mobile/tablet (≤1024px) hero artwork swapped to the attached `Untitled-2.jpg`
  (compact **and** intermediate breakpoints).
- Live `.hero-title`/`.hero-sr-only` text moved back to the original paper-strip's
  title position; subtitle kept seal-red.
- `.hero-stamp` (day-count, `data-start="2025-09-30"`, currently rendering "294")
  repositioned to upper-right.
- `.hero-dek-panel` kept inside the first viewport.
- `.scroll-indicator` ("向下捲動探索") made smaller, kept visible, bounce animation retained.
- **Desktop** Chapter 1 timeline: cards now reveal progressively in sync with
  `#center-main-line-fill`'s height, and reverse correctly on scroll-up (this was
  explicitly scoped to desktop, not mobile, per the user).

These were verified live in-browser at the time but have **no corresponding
tasks.md entries** in any change — there's no formal record of what "done" means
for them beyond the session's own screenshots.

## New issue backlog — found after the above, NOT YET TRIAGED

After the ad-hoc round above, further live-device/desktop testing turned up a large,
messy batch of new observations (mix of real bugs, new motion/choreography requests,
visual polish, and a few incomplete phrases like "Cover chap 3" that aren't specified
enough to act on). These were pasted into a separate AI session which proposed
splitting them into three buckets/changes — **not yet created, this is a proposal
only**:

1. **`fix-responsive-story-acceptance-gaps`** (would revisit `stabilize-responsive-story-layout`'s
   claims) — Chapter 2 bars crowding / Y-axis overflowing its container at
   641–1024px; Hero stamp risk of covering the title; last story card vs. chart
   overlap state; Chapter 2's last card entering too early; chapter-transition
   ordering on forward/reverse scroll; per-component misalignment even where no
   page-level horizontal overflow exists.
2. **`refine-story-scroll-choreography`** (new interaction/motion, desktop `≥1025px`
   unless noted) — `center-main-line` appearing 40px before a `timeline-row`
   item-node starts; a card triggering when the line passes 40px before it; the
   line's end becoming an arrow, reverting to a line with a pulsing question mark
   at the final point; Chapter 2 showing an empty gray chart on card 1 and
   highlighting X/Y axes only on card 2; a reveal animation for the gray
   `#ch3-bar-total-grey` layer; `#ch3-sticky-box-wrapper` centered vertically in
   the viewport; last card/chart "scroll up" together when they'd otherwise
   overlap; Chapter 2's closing paragraph waiting until the last card+image have
   scrolled out before appearing.
3. **`polish-story-page-visual-hierarchy`** — `.scroll-indicator` contrast (also
   centered alignment specifically below 735px); footer visually distinguished
   from body; `.hero-stamp` enlarged (while still not covering the title — that
   part is bucket 1, the size increase is bucket 3).
4. **Needs specification before any change is written** — fragments too vague to
   implement as-is: "Also have animation with th…", "Cover chap 3", "follow desktop
   concept" (unclear which component), duplicate/garbled Chapter 3 HTML pastes.

**Nothing here has been written into a `proposal.md` yet.** The raw notes (with
duplicates) are only in this session's chat history — if picking this up cold,
ask the user for the original notes again or check chat history before assuming
the triage above is complete/correct.

## Recommended next steps (in order)

1. **Commit `index-v2.html`, `database-v2.html`, `hero-collage-mobile-clean.jpg`**
   — this is the single highest-risk open item; three completed changes' worth of
   work has zero durability right now.
2. Decide whether to archive `polish-index-database-v2`,
   `stabilize-responsive-story-layout`, and `refine-v2-mobile-hero-cards-axis`
   (sync their capabilities into `openspec/specs/`) before or after triaging the
   new backlog — archiving now gives an accurate spec baseline to diff the new
   bug reports against.
3. Turn the new-issue backlog into an actual triage table (ID / viewport /
   component / current / expected / severity / bucket) before writing any new
   `proposal.md` — several items are duplicated or too vague as-is (see bucket 4).
4. Only then run `/spectra-propose` for `fix-responsive-story-acceptance-gaps`
   first (regressions against an already-"done" change), then
   `refine-story-scroll-choreography`, then `polish-story-page-visual-hierarchy`
   — deliberately in that order so animation/choreography work doesn't get
   layered on top of a still-broken layout baseline.

## How to test

```
cd 115MoneyDemoB-main && python3 -m http.server 8001
```
Open `http://localhost:8001/index-v2.html`. For phone testing, bind to `0.0.0.0`
and use the machine's LAN IP. Verify at minimum: 390×844, 768×1024, 1366×768 —
the three widths the last verification pass used for forward/reverse scroll checks.

## Related

See `HANDOFF.md` for the (separate, committed) `index.html` perf + newsprint-identity
work, and `LEARNINGS.md` for architecture gotchas that mostly still apply to the
"rebuilt" chapter classes shared by both files (`.gantt-fixed-stage-rebuilt`,
`.gantt-sticky-box-rebuilt`, the absolutely-positioned Gantt frame, the two
different step-trigger mechanisms for Chapter 2 vs. Chapter 3).
