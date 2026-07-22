## Context

`115MoneyDemoB-main/index-v2.html` is the duplicate review copy of the CNA FY115 budget-review report. Four phone/tablet issues remain after the previous polish round; all were reproduced live and root-caused during `/spectra-discuss`. Three are localized CSS fixes (scroll indicator, line breaking, Chapter-4 axis); one (mobile Chapter-2/3 card motion) is a structural rework of the mobile scrollytelling layout. The live `index.html`/`database.html` are out of scope and must stay untouched.

## Goals / Non-Goals

**Goals:**

- On phone, the hero「向下捲動探索」indicator (text + downward line) is never clipped by the hero's torn `clip-path` bottom, and remains visible with its bounce.
- Chinese body text in the hero dek and story cards no longer orphans punctuation at line boundaries.
- On phone/tablet, Chapter-2 and Chapter-3 story cards travel continuously bottom-to-top with the chart pinned as a top band and the cards reading below it — no in-place pop, no black gap between cards.
- On phone, the Chapter-4 numeric axis numbers do not collide and align horizontally with the bars above them.
- Desktop (≥969px) appearance is unchanged for all four areas (except the punctuation-only `line-break: strict`, which is safe everywhere).

**Non-Goals:**

- Any edit to `index.html`, `database.html`, or `database-v2.html`.
- `word-break: auto-phrase` (declined; `line-break: strict` only).
- Fixing the pre-existing desktop `.gantt-card-rebuilt { margin-left: 40% }` horizontal overflow (present in the original, clipped by `body { overflow-x: hidden }`).

## Decisions

### Scroll indicator stays on phone, raised and with a smaller bounce

Keep `.scroll-indicator` visible on phone. In the phone media query, raise its `bottom` offset (from `40px` to roughly `90px`) and reduce the `bounce` keyframe's vertical travel for phone so that neither the label nor its `::after` downward line ever enters the hero-section's torn `clip-path` bottom edge (which, combined with `overflow: hidden`, is what currently clips it). Desktop keeps the original position and bounce.

Rejected alternative: hiding the indicator on phone. Rejected because the user asked to keep it; raising + shrinking the bounce solves the clipping without removing the affordance.

### Chinese line breaking uses justify + line-break: strict (no auto-phrase)

Keep `text-align: justify` on the hero dek paragraph and all `.story-card p`, and add `line-break: strict`. `line-break: strict` applies CJK 禁則: an opening bracket「（「 is not left at line-end and a closing bracket / 、 / 。「）」is not pushed to line-start. Where a specific block still breaks poorly, reduce that block's font-size by one step. Do not add `word-break: auto-phrase`.

Rejected alternative: `word-break: auto-phrase` for dictionary-based phrase breaking. It would give phrase-level breaks but is declined for this round in favor of relying on `line-break: strict` only (per the discuss decision); it can be revisited separately. Trade-off acknowledged: `line-break: strict` fixes punctuation orphaning but not mid-phrase splits under justify.

### Mobile Chapter-2/3 rework: pinned top chart band + cards scroll below (C2)

On phone/tablet (`max-width: 968px`), replace the current "chart pinned full-screen (100dvh) + story cards swapped in place via ±40px translate/opacity per step" with a "pinned top band + cards below" layout:

- The Chapter-2 Gantt stage and Chapter-3 stacked-bar stage are pinned as a **top band occupying roughly the upper 58dvh** of the viewport, opaque, with a bottom divider.
- The `.gantt-card-rebuilt` story cards flow in the **lower ~42dvh reading zone** in normal document/scroll order, so as the reader scrolls each card enters from the bottom of the reading zone and exits at the top — continuous bottom-to-top travel matching the desktop feel, with no black gap between consecutive cards.
- The existing scroll-step logic that animates the chart (Chapter-2 bar growth tied to `scrollPercent`/step, Chapter-3 segment progression) stays and continues to advance so the chart change and the card in the reading zone are legible together.
- Remove the mobile per-step `.gantt-card-rebuilt` opacity/visibility/translate fade-swap rules that implement the current full-screen in-place approach, since cards are now positioned by scroll flow rather than toggled.

Behavior contract for the card that references the chart: when Chapter-2 card 2 ("中央政府總預算案原則上應於前一年度底完成審議…") is in the lower reading zone, the pinned top band already shows the Gantt bars (kept in sync by the existing bar-grow logic), so the chart and its describing card are visible together.

Rejected alternative C1: keep the full-screen pinned fade but enlarge the translate to ±100–120px and tighten timing. Rejected as the primary approach because discrete per-step fade-swaps on a full-screen stage cannot produce continuous travel and still leave a black centre between cards; C2 restructures so motion is inherently continuous. This reuses the "Option A: pinned top chart band + cards below" plan already documented in `115MoneyDemoB-main/HANDOFF.md` before it was replaced by the current full-screen fade.

### Chapter-4 numeric axis: match bar grid + thin to 3 ticks on phone

On phone, change `.p-scale-axis-linear` to the same grid template as the bar rows (`1fr 72px 1fr`, gap `6px`) so its ticks align horizontally with the bars, and reduce each side (`.linear-ticks-left`, `.linear-ticks-right`) from 5 numbers to 3 (0 / 200 / 400) with a slightly smaller font, so the 3-digit numbers no longer collide in the narrow columns. Desktop keeps all 5 ticks and the original grid.

Rejected alternative: keep all 5 ticks and only shrink the font. Rejected because 5 three-digit numbers do not fit legibly in a ~140px phone column even smaller; 0/200/400 stays unambiguous and matches the bar scale.

## Implementation Contract

**Behavior:**
- Phone hero: `.scroll-indicator` label and its downward line are fully within the hero's visible (un-clipped) area throughout the bounce cycle.
- Hero dek + story cards: no line begins with a closing punctuation (」）、。！？) and no line ends with an opening bracket (（「) in Chinese paragraphs, at phone and desktop widths.
- Phone/tablet Chapter-2/3: the Gantt/stacked-bar chart is pinned in the top ~58dvh; story cards appear in the lower ~42dvh and move upward continuously as the user scrolls, never overlapping the pinned band and never leaving a full-viewport black gap between two consecutive cards; the chart animation stays in step with the card in the reading zone.
- Phone Chapter-4: the numeric axis shows 0/200/400 per side, aligned to the bar columns, with no overlapping numbers.
- Desktop (≥969px): hero indicator position/bounce, Chapter-2/3 scrollytelling layout, and Chapter-4 axis (5 ticks) are unchanged.

**Interface / data shape:** CSS-only for items 1, 2, 4; item 3 is CSS layout plus removal of the now-obsolete mobile per-step card fade rules, keeping the existing scroll-step JavaScript. No data or markup-structure changes beyond possibly hiding the 4th/5th axis `<span>`s on phone via CSS.

**Failure modes:** N/A at runtime (static CSS/existing JS). The failure to avoid is desktop visual drift (any of these leaking above 968px) and reintroducing chart/card overlap on mobile.

**Acceptance criteria:**
- Live phone check (≤430px width): scroll indicator fully visible across the bounce; Chapter-2 card 1 and card 2 both slide up through the lower zone with the chart pinned above and populated; no black full-screen gap between cards; Chapter-4 axis reads 0/200/400 per side with no overlap.
- Live desktop check (≥1024px): hero, Chapter-2/3 scrollytelling, and Chapter-4 axis look identical to before this change.
- Chinese-break check: inspect the hero dek and at least two story cards at phone width and confirm no orphaned punctuation at line starts/ends.
- `git diff` shows changes only in `115MoneyDemoB-main/index-v2.html`.

**Scope boundaries:** In scope — the four fixes above, in `index-v2.html`, phone/tablet-scoped (except punctuation `line-break: strict`). Out of scope — the live originals, `database-v2.html`, `word-break: auto-phrase`, and the pre-existing desktop card overflow.

## Risks / Trade-offs

- [Risk] The C2 mobile rework could reintroduce the chart/card overlap the full-screen-pinned approach was meant to avoid. → Mitigation: pin the chart as an opaque top band with a higher stacking context than the cards, and keep cards constrained to the lower reading zone; verify no overlap live at phone width before closing.
- [Risk] Changing the mobile card layout could desync the existing scroll-step chart animation (bars/segments) from the visible card. → Mitigation: keep the existing step logic and verify card 2 ↔ populated Gantt sync live, as in the prior round.
- [Risk] `line-break: strict` under `justify` still allows mid-phrase splits, so the user may still see some non-ideal breaks. → Mitigation: this is the accepted trade-off of the "justify + strict, no auto-phrase" decision; font-size nudges reduce it, and auto-phrase remains available as a future enhancement.
- [Risk] Thinning Chapter-4 axis to 3 ticks removes intermediate references (100, 300). → Mitigation: 0/200/400 preserves scale readability; the bars themselves carry the precise values via their labels.
