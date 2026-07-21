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
| `fix-responsive-story-acceptance-gaps` | 14/14 | Bucket 1: hero stamp/title collision margin, Ch2 Gantt intermediate-width frame, Ch2 step-9 card/image sequencing, Ch2→3 exit guard extension | Yes — `openspec/changes/archive/2026-07-21-fix-responsive-story-acceptance-gaps/` (commit `970fd43` implement, `b662403` archive) |
| `refine-chapter1-timeline-choreography` | 11/11 | Bucket 2a: Ch1 timeline 40px line-lead, pulsing-"?"/arrow terminal marker, 641-1024px reveal extension | Yes — `openspec/changes/archive/2026-07-21-refine-chapter1-timeline-choreography/` (commit `c6d030b` implement, `b662403` archive) |
| `refine-chapter2-chapter3-reveal-choreography` | 13/13 | Bucket 2b: Ch2 card-1 gray state, Ch3 grey-bar distinct reveal, Ch3 sticky-box centering, Ch3 intro-reveal gating | Yes — `openspec/changes/archive/2026-07-21-refine-chapter2-chapter3-reveal-choreography/` (commit `aebde13` implement, `b662403` archive) |

The first three are functionally done per their `tasks.md` checkboxes and were
verified in a prior session via browser screenshots + DOM overflow checks across a
7-viewport matrix (390×844 up to 1440×900), forward/reverse scroll checks, and
reduced-motion/no-JS states. The latter three (Buckets 1 and 2) were verified via
**source-level geometric/logical review only** — this session's browser automation
cannot reach `localhost` dev servers in this environment (`chrome-error://
chromewebdata/` despite `curl` returning 200, confirmed on 3+ separate attempts) —
user explicitly signed off on proceeding this way.

`openspec/specs/` now has an accepted baseline for
`responsive-editorial-hero`, `chapter-visual-exit`,
`editorial-type-and-color-hierarchy`, `chart-viewport-clearance`,
`responsive-storytelling-motion`, `mobile-scrollytelling-card-motion`,
`cjk-line-breaking`, `hero-scroll-indicator-visibility`,
`chapter4-axis-mobile-legibility`, `project-card-keyword-tags`,
`desktop-pill-row-scroll`, `chapter1-timeline-motion-choreography` (new), and
`chapter2-chapter3-reveal-refinements` (new) — this is the current baseline
Buckets 3/4 (below) should be diffed against.

Note: the `spectra-sync-specs` skill referenced by `spectra-archive`'s
`SKILL.md` does not actually exist on this machine — spec syncing for all six
changes archived so far was done by hand (writing `openspec/specs/<capability>/
spec.md` directly from each change's delta — a new capability needs a full
Purpose+Requirements doc; an existing one needs the delta merged into the
current file, checking for interleaving deltas from multiple changes touching
the same capability), then each change was archived with `spectra archive <name>
--skip-specs` to avoid double-applying. `@trace` metadata was not injected (that
requires `.spectra/touched/<name>.json`, which was already cleaned up per the
skill's own step ordering). Separately, that same `.spectra/touched/<name>.json`
tracking file is unreliable for `/spectra-commit`'s purposes in this repo — it
picks up hundreds of unrelated pre-existing untracked files rather than just
what a task touched, so `/spectra-commit` runs here should stage from `git
status` directly instead of trusting that file.

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
   **Status: shipped — implemented, committed (`970fd43`), archived (`b662403`), pushed.**
2. Bucket 2 was split into two changes after review flagged the original single
   9-item/3-chapter scope as too large:
   - **`refine-chapter1-timeline-choreography`** — `center-main-line` appearing 40px
     before a `timeline-row` item-node starts; a card triggering when the line passes
     40px before it (implemented as one combined 40px-lead offset on the card's own
     reveal threshold); the line's end becoming an arrow, reverting to a line with a
     pulsing question mark at the final point; `CH1-TIMELINE-INTERMEDIATE-01`
     (extending the desktop-only Chapter 1 timeline reveal to the 641–1024px
     intermediate breakpoint).
     **Status: shipped — implemented, committed (`c6d030b`), archived (`b662403`), pushed.**
   - **`refine-chapter2-chapter3-reveal-choreography`** — Chapter 2 showing an empty
     gray chart on card 1 and highlighting X/Y axes only on card 2; a reveal animation
     for the gray `#ch3-bar-total-grey` layer; `#ch3-sticky-box-wrapper` centered
     vertically at desktop width (found the actual CSS cascade winner —
     `align-items: flex-start !important`, unconditional, wins at every breakpoint
     today — and overrode it desktop-only without touching the header-clearance
     anchor); last card/chart "scroll up" together when they'd otherwise overlap
     (**turned out to need no code** — Chapter 3's chart is `position: sticky` and
     already moves with the last card via the existing `--ch3-exit-offset` transform,
     unlike Chapter 2's `position: fixed` backdrop which genuinely needed Bucket 1's
     opacity-fade fix; downgraded to verification-only); Chapter 2's closing/Chapter 3
     intro text now explicitly gated on `history-exit-complete` instead of the far
     coarser "whole Ch2 section has scrolled past" signal.
     **Status: shipped — implemented, committed (`aebde13`), archived (`b662403`), pushed.**
3. **`polish-story-page-visual-hierarchy`** — `.scroll-indicator` contrast (also
   centered alignment specifically below 735px); footer visually distinguished
   from body; `.hero-stamp` enlarged (while still not covering the title — that
   part is bucket 1, the size increase is bucket 3). **Status: triaged only, no
   `proposal.md` yet.**
4. **Needs specification before any change is written** — fragments too vague to
   implement as-is: "Also have animation with th…", "Cover chap 3", duplicate/
   garbled Chapter 3 HTML pastes. **Status: still needs the user re-asked for
   clarification, not actionable from the existing notes.**

## Buckets 1-2 — implementation notes worth keeping

All three changes above went through the full propose → apply → commit → archive
cycle in this session. A few things worth remembering if picking this up cold:

- **Caught a sign-error bug during apply**: `refine-chapter1-timeline-choreography`'s
  own `design.md` said to *subtract* 40px from the card's reveal threshold, which
  actually would have made the card reveal *earlier* — contradicting both the spec
  text and the design's own stated rationale ("line arrives, then card follows").
  Caught by working through concrete numbers before shipping; fixed to *add* 40px,
  and corrected `design.md`/`tasks.md` to match so the artifacts don't contradict
  the code.
- **The `#ch3-sticky-box-wrapper` centering fix required tracing the real cascade**,
  not just the first-declared `align-items` rule — a later, unconditional (not
  media-scoped) rule with `!important` was the actual winner at every breakpoint.
  The fix only works because that same rule's `padding` (not `align-items`) is what
  enforces the header-clearance minimum, so re-centering never violates it.
- **Verification for all three changes was source-level only** — this session's
  Chrome extension can't reach `localhost:8001` (`chrome-error://chromewebdata/`
  despite `curl` returning 200, confirmed again on a fresh attempt this session).
  If real pixel verification is ever needed, that environment issue needs solving
  first, or use a different viewing method.
- **`spectra park`/`unpark` moves change files into `.git/spectra-app/changes/<name>/`**
  — invisible to normal `ls`/`git status` but not lost; confirm with `spectra list
  --parked --json`.

## Recommended next steps (in order)

1. ~~Commit `index-v2.html`, `database-v2.html`, `hero-collage-mobile-clean.jpg`~~ — done, `8bb65ca`.
2. ~~Archive the three completed changes~~ — done, `6fcf12a`.
3. ~~Turn the new-issue backlog into an actual triage table~~ — done, see
   `ISSUE-TRIAGE-v2.md`, all open questions resolved against source code.
4. ~~Propose, implement, commit, and archive Bucket 1 (`fix-responsive-story-acceptance-gaps`)~~
   — done, see above.
5. ~~Propose, implement, commit, and archive Bucket 2 (split into
   `refine-chapter1-timeline-choreography` + `refine-chapter2-chapter3-reveal-choreography`)~~
   — done, see above.
6. Propose `polish-story-page-visual-hierarchy` (Bucket 3) next.
7. Bucket 4 fragments still need the user re-asked for clarification before any
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
