## Summary

Four mobile/RWD polish fixes on `115MoneyDemoB-main/index-v2.html` found during live device testing: uncut scroll indicator, Chinese-grammar-aware line breaking, a re-architected mobile Chapter-2/3 scrollytelling that makes story cards travel bottom-to-top (instead of popping in place), and a de-crowded Chapter-4 comparison axis.

## Motivation

After the previous `polish-index-database-v2` round, live testing on phone and iPad surfaced four remaining issues on `index-v2.html`. Each was reproduced and root-caused during `/spectra-discuss`:

1. The hero「向下捲動探索」scroll indicator is clipped. It sits at `bottom: 40px` with a downward line plus a `bounce` animation, inside `.hero-section` which has `overflow: hidden` and a torn `clip-path` bottom edge; on phone the tall dek-panel pushes it against that torn edge and the bounce drives it into the clip.
2. Chinese body text breaks at grammatically wrong points. The hero dek and `.story-card` paragraphs use `text-align: justify` with default line-breaking, so lines break mid-phrase and punctuation gets orphaned at line boundaries (violating CJK 禁則), e.g.「（從9月至隔年5月）」splitting awkwardly.
3. Mobile Chapter-2/3 story cards still "pop" rather than slide. The current mobile layout pins the chart full-screen (100dvh) and swaps cards in place with a ±40px translate + fade. ±40px is too small to read as travel, and the discrete per-step fade-swaps on a full-screen pinned stage leave a large black gap between consecutive cards. The user asked repeatedly for the desktop-like continuous bottom-to-top motion; incremental CSS nudges have not delivered it.
4. The Chapter-4 comparison chart's numeric axis (`.p-scale-axis-linear`) is crowded on phone. It uses grid `1fr 120px 1fr` with 5 numbers per side (400/300/200/100/0) absolutely positioned at 0/25/50/75/100%; on a narrow phone each 1fr column is ~140px so the 3-digit numbers collide. It also no longer matches the bar rows' grid (`.pyramid-align-row` was changed to `1fr 72px 1fr` earlier but this axis was not), so axis ticks and bars are horizontally misaligned.

## Proposed Solution

All edits target `115MoneyDemoB-main/index-v2.html` only; the live `index.html` and `database.html` are not touched.

1. **Scroll indicator (keep on phone):** raise `.scroll-indicator` on phone from `bottom: 40px` to roughly `bottom: 90px` and reduce the `bounce` animation's vertical amplitude on phone, so the text and its downward line always stay clear of the hero's torn `clip-path` bottom edge. Do not hide it.
2. **Chinese line-breaking (keep justify):** keep `text-align: justify` and add `line-break: strict` to the hero dek paragraph and all `.story-card p`, so punctuation 禁則 is enforced (no opening bracket at line-end, no closing bracket / 、 / 。 orphaned at line-start). Nudge the affected body font-size down one step only where it demonstrably improves breaking. Do not add `word-break: auto-phrase` (per the decision to rely on `line-break: strict` only).
3. **Mobile Chapter-2/3 scrollytelling — C2 rework (pinned top chart band + cards scroll below):** on phone/tablet (`max-width: 968px`), stop pinning the chart full-screen and stop the in-place fade-swap. Instead pin the Gantt chart (Chapter 2) / stacked bar (Chapter 3) as a top band (~58dvh) and let the `.gantt-card-rebuilt` story cards flow in the lower reading zone (~42dvh) in normal scroll order, so they travel continuously bottom-to-top exactly like the desktop layout, with no black gap between cards. Keep the existing scroll-step logic that drives the chart animation (bars growing, chapter-3 segments) in sync with the card currently in the reading zone. This reuses the "pinned top band + cards below" approach originally documented in `115MoneyDemoB-main/HANDOFF.md` before it was replaced by the current full-screen fade.
4. **Chapter-4 axis (de-crowd + align):** update `.p-scale-axis-linear` on phone to use the same grid template as the bar rows (`1fr 72px 1fr`, gap 6px) so ticks align with the bars, and reduce each side to 3 ticks (0 / 200 / 400) with a slightly smaller font on phone so the numbers no longer collide.

## Non-Goals (optional)

- Any change to the live `index.html` / `database.html`, or to `database-v2.html` (this round is `index-v2.html` only).
- Adding `word-break: auto-phrase` — explicitly declined in favor of `line-break: strict` only.
- Desktop (≥969px) hero, scrollytelling, or Chapter-4 axis appearance — desktop must stay visually unchanged; all four fixes are phone/tablet-scoped except the punctuation `line-break: strict` (which is safe on desktop too).
- Re-introducing the pre-existing desktop `.gantt-card-rebuilt` `margin-left: 40%` horizontal overflow (already present in the original, clipped by `body { overflow-x: hidden }`, out of scope).

## Alternatives Considered (optional)

- **Card motion C1 (patch current full-screen fade):** increase the translate distance to ±100–120px and tighten timing. Rejected as the primary fix because it still relies on discrete per-step fade-swaps on a full-screen pinned stage, which cannot produce continuous travel and still leaves a black gap; chosen C2 (rework) instead because it structurally delivers the requested behavior.
- **Chapter-4 axis: keep all 5 ticks, only shrink font.** Rejected in favor of thinning to 3 ticks on phone because 5 three-digit numbers do not fit legibly in a ~140px column even at a smaller size; 0/200/400 is unambiguous and matches the bar scale.

## Impact

- Affected specs: mobile-scroll-story-card-motion, cjk-line-breaking, hero-scroll-indicator-visibility, chapter4-axis-mobile-legibility
- Affected code:
  - Modified: 115MoneyDemoB-main/index-v2.html
  - New: (none)
  - Removed: (none)
