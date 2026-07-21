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

## ✅ Resolved 2026-07-21: commit + archive done

Previously this section flagged `index-v2.html`/`database-v2.html`/
`hero-collage-mobile-clean.jpg` as untracked with zero commit history. That's
fixed as of commit `8bb65ca` (files committed) and `6fcf12a` (the three
changes below archived, 11 capability specs synced into `openspec/specs/`).
No outstanding git-safety risk on this file as of this writing — re-check
`git status` if picking this up much later.

One spec-merge decision made during archiving, in case it matters later: the
newer change's `mobile-scroll-story-card-motion` delta was **merged into** the
existing `mobile-scrollytelling-card-motion` spec (same component, the former
documented the pinned-top-band mechanism that superseded the latter's
original in-place-fade requirement) rather than kept as two separate specs —
user confirmed this merge explicitly.

## Spectra changes on this file (all tasks complete, all archived)

| Change | Tasks | Scope | Archived? |
|---|---|---|---|
| `polish-index-database-v2` | 23/23 | Created `-v2` duplicates; 21 reported layout/copy/interaction fixes across both pages | Yes — `openspec/changes/archive/2026-07-21-polish-index-database-v2/` |
| `stabilize-responsive-story-layout` | 23/23 | Responsive hero, editorial type/color roles, 3-tier (compact/intermediate/wide) layout+motion contract, header-aware chart clearance, Chapter 2 exit lifecycle | Yes — `openspec/changes/archive/2026-07-21-stabilize-responsive-story-layout/` |
| `refine-v2-mobile-hero-cards-axis` | 8/8 | Scroll-indicator clipping, CJK line-breaking (`line-break: strict`), mobile Ch2/3 card motion rework (pinned top band + cards flow below), Chapter-4 axis de-crowd/align | Yes — `openspec/changes/archive/2026-07-21-refine-v2-mobile-hero-cards-axis/` |

All three are functionally done per their `tasks.md` checkboxes and were verified in
a prior session via browser screenshots + DOM overflow checks across a 7-viewport
matrix (390×844 up to 1440×900), forward/reverse scroll checks, and reduced-motion /
no-JS states. `openspec/specs/` now has an accepted baseline for
`responsive-editorial-hero`, `chapter-visual-exit`,
`editorial-type-and-color-hierarchy`, `chart-viewport-clearance`,
`responsive-storytelling-motion`, `mobile-scrollytelling-card-motion`,
`cjk-line-breaking`, `hero-scroll-indicator-visibility`,
`chapter4-axis-mobile-legibility`, `project-card-keyword-tags`, and
`desktop-pill-row-scroll` — this is the baseline the new-issue backlog's
"acceptance gap" bucket (below) should be diffed against.

Note: the `spectra-sync-specs` skill referenced by `spectra-archive`'s
`SKILL.md` does not actually exist on this machine — spec syncing for all
three changes was done by hand (writing `openspec/specs/<capability>/spec.md`
directly from each change's delta), then each change was archived with
`spectra archive <name> --skip-specs` to avoid double-applying. `@trace`
metadata was not injected (that requires `.spectra/touched/<name>.json`,
which was already cleaned up per the skill's own step ordering).

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

## New issue backlog — triaged into 4 buckets

After the ad-hoc round above, further live-device/desktop testing turned up a large,
messy batch of new observations (mix of real bugs, new motion/choreography requests,
visual polish, and a few incomplete phrases like "Cover chap 3" that aren't specified
enough to act on). Full triage table (ID/viewport/component/current/expected/severity)
is in `ISSUE-TRIAGE-v2.md`. Open questions from the original notes (exact
component/viewport for the layout complaint, whether the Ch3 sticky-box centering is
a bug or a preference, vague fragments) have all been resolved against the actual
source code — see that file's "resolved against code" notes.

1. **`fix-responsive-story-acceptance-gaps`** (regressions against the now-archived
   `stabilize-responsive-story-layout` baseline) — Chapter 2 bars crowding / Y-axis
   overflowing its container at 641–1024px; Hero stamp risk of covering the title;
   last story card vs. chart overlap state (downgraded P1→P2 after code review —
   reframed as verify/harden, not a confirmed break); Chapter 2's last card entering
   too early; chapter-transition ordering on forward/reverse scroll; per-component
   misalignment even where no page-level horizontal overflow exists.
   **Status: proposed and parked** — see below.
2. **`refine-story-scroll-choreography`** (new interaction/motion, desktop `≥1025px`
   unless noted) — `center-main-line` appearing 40px before a `timeline-row`
   item-node starts; a card triggering when the line passes 40px before it; the
   line's end becoming an arrow, reverting to a line with a pulsing question mark
   at the final point; Chapter 2 showing an empty gray chart on card 1 and
   highlighting X/Y axes only on card 2; a reveal animation for the gray
   `#ch3-bar-total-grey` layer; `#ch3-sticky-box-wrapper` centered vertically in
   the viewport (confirmed not-a-bug — it's deliberately top-anchored per the
   archived `chart-viewport-clearance` spec, so this is a spec amendment, not a
   fix); last card/chart "scroll up" together when they'd otherwise overlap;
   Chapter 2's closing paragraph waiting until the last card+image have scrolled
   out before appearing; also picked up `CH1-TIMELINE-INTERMEDIATE-01` (extending
   the desktop-only Chapter 1 timeline reveal to the 641–1024px intermediate
   breakpoint — a new feature request, not a bug, split out from the original
   layout complaint). **Status: triaged only, no `proposal.md` yet.**
3. **`polish-story-page-visual-hierarchy`** — `.scroll-indicator` contrast (also
   centered alignment specifically below 735px); footer visually distinguished
   from body; `.hero-stamp` enlarged (while still not covering the title — that
   part is bucket 1, the size increase is bucket 3). **Status: triaged only, no
   `proposal.md` yet.**
4. **Needs specification before any change is written** — fragments too vague to
   implement as-is: "Also have animation with th…", "Cover chap 3", duplicate/
   garbled Chapter 3 HTML pastes. **Status: still needs the user re-asked for
   clarification, not actionable from the existing notes.**

## `fix-responsive-story-acceptance-gaps` — proposed and parked, NOT committed

Full Spectra proposal workflow ran via `/spectra-propose` on 2026-07-21: `proposal.md`
(Bug Fix format, 4 root-caused defects with exact `index-v2.html` line citations),
`design.md` (4 decisions: hero-stamp position from title geometry, extend the
existing intermediate-breakpoint Gantt-frame block, `transitionend`-driven card/image
sequencing, extend `updateHistoryExit()`'s exit guard to the last story card),
3 spec deltas (`responsive-editorial-hero`, `chart-viewport-clearance`,
`chapter-visual-exit` — all ADDED requirements, since items 1–2 were pure
implementation gaps against already-correct spec text and only items 3–4 needed new
normative requirements), and `tasks.md` (5 groups, 14 tasks). `spectra analyze` is
clean on all 4 dimensions, `spectra validate` passed, then the change was parked
per the propose skill's workflow.

**Important: parking moves the change's files out of `openspec/changes/` into
`.git/spectra-app/changes/fix-responsive-story-acceptance-gaps/`** — they will
*not* show up in a normal `ls openspec/changes/` or `git status` (that path is
inside `.git/`, which is why it looks "gone" if you go looking for it the ordinary
way). Nothing is lost — `spectra list --parked --json` confirms it's there with all
14 tasks. Run `/spectra-apply fix-responsive-story-acceptance-gaps` (auto-unparks)
when ready to implement.

Branch decision (2026-07-21): staying on `optimize-index-frontend-perf` for this
work rather than cutting a new branch — this branch already holds the entire
`index-v2.html` workstream (perf, `stabilize-responsive-story-layout`, this handoff,
the triage doc), so keeping the fix here keeps it in context. Revisit if a
standalone PR for just the acceptance-gap fixes (separate from the earlier
perf/stabilize work) becomes desirable.

## Recommended next steps (in order)

1. ~~Commit `index-v2.html`, `database-v2.html`, `hero-collage-mobile-clean.jpg`~~ — done, `8bb65ca`.
2. ~~Archive the three completed changes~~ — done, `6fcf12a`.
3. ~~Turn the new-issue backlog into an actual triage table~~ — done, see
   `ISSUE-TRIAGE-v2.md`, all open questions resolved against source code.
4. ~~Run `/spectra-propose` for `fix-responsive-story-acceptance-gaps`~~ — done,
   parked (see above). Run `/spectra-apply fix-responsive-story-acceptance-gaps`
   when ready to implement.
5. Then propose `refine-story-scroll-choreography`, then
   `polish-story-page-visual-hierarchy` — deliberately in that order so
   animation/choreography work doesn't get layered on top of a still-broken
   layout baseline.
6. Bucket 4 fragments still need the user re-asked for clarification before any
   change can be written for them.

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
