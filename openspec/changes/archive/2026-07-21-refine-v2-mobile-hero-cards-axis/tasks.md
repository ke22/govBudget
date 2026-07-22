## 1. 報導頁 hero：捲動指示器不被裁切

- [x] 1.1 Implement "Scroll indicator stays on phone, raised and with a smaller bounce" in `index-v2.html`, satisfying the "Hero scroll indicator stays fully visible on phone" requirement: in the phone media query, raise `.scroll-indicator` from `bottom: 40px` to ~`90px` and reduce the `bounce` keyframe's vertical amplitude for phone so the label and its `::after` downward line never enter the hero's torn `clip-path` bottom edge; keep it visible (do not hide). Verify at ≤430px that the full indicator stays visible across the whole bounce cycle, and at ≥969px that its position/bounce are unchanged.

## 2. 報導頁：中文斷行禁則

- [x] 2.1 Implement "Chinese line breaking uses justify + line-break: strict (no auto-phrase)" in `index-v2.html`, satisfying the "Chinese body text enforces punctuation line-break rules" requirement: add `line-break: strict` to the hero dek paragraph and all `.story-card p` while keeping `text-align: justify`; nudge a block's font-size down one step only where it demonstrably improves breaking; do NOT add `word-break: auto-phrase`. Verify at phone width on the hero dek and at least two story cards that no wrapped line starts with 」）、。！？ or ends with （「.

## 3. 報導頁：手機版第二／三章捲動敘事重構（C2）

- [x] 3.1 Implement the "Mobile Chapter-2/3 rework: pinned top chart band + cards scroll below (C2)" decision for Chapter-2 in `index-v2.html`, satisfying the "Mobile Chapter-2/3 chart pins as a top band with cards scrolling below" requirement (Chapter-2 portion): on `max-width: 968px`, pin the Gantt stage as an opaque top band (~58dvh) with a bottom divider and remove the full-screen (100dvh) pinning; move the `.gantt-card-rebuilt` cards into the lower ~42dvh reading zone in normal scroll flow; remove the obsolete mobile per-step opacity/visibility/translate fade-swap rules for `#chapter-2-rebuilt .gantt-card-rebuilt`. Verify live at phone width that Chapter-2 cards 1 and 2 travel continuously bottom-to-top in the lower zone, the Gantt band stays pinned above and never overlaps a card, and there is no full-viewport black gap between consecutive cards.
- [x] 3.2 Apply the same C2 top-band + cards-below rework to Chapter-3 in `index-v2.html` (stacked-bar stage pinned ~58dvh top band, cards flowing in the lower ~42dvh), satisfying the same requirement for Chapter-3. Verify live at phone width that Chapter-3 cards travel bottom-to-top without overlapping the pinned stacked-bar band and without a black gap.
- [x] 3.3 Confirm the chart animation stays in sync after the C2 rework, satisfying the "Chart and its describing card visible together" scenario: keep the existing scroll-step logic and verify live that when Chapter-2 card 2 ("中央政府總預算案原則上應於前一年度底完成審議…") is in the reading zone, the pinned Gantt band already shows the bars populated (bars grow with the card, not after it).
- [x] 3.4 Confirm no desktop regression from the C2 rework: verify at ≥1024px that the desktop Chapter-2/3 scrollytelling layout and card motion are visually unchanged (all C2 rules gated to `max-width: 968px`).

## 4. 報導頁：第四章數字軸不擁擠

- [x] 4.1 Implement the "Chapter-4 numeric axis: match bar grid + thin to 3 ticks on phone" decision in `index-v2.html`, satisfying the "Chapter-4 numeric axis is legible and aligned on phone" requirement: on phone, set `.p-scale-axis-linear` grid to `1fr 72px 1fr` (gap 6px) to align with the bar rows, and reduce each side (`.linear-ticks-left`/`.linear-ticks-right`) to 3 ticks (0 / 200 / 400) with a smaller font (hiding the 100 and 300 spans on phone). Verify at phone width that each side shows 0/200/400 with no overlap and the ticks align with the bar columns, and at ≥969px that all five ticks and the original grid remain.

## 5. 驗證與收尾

- [x] 5.1 Confirm scope: run `git diff -- 115MoneyDemoB-main/index.html 115MoneyDemoB-main/database.html 115MoneyDemoB-main/database-v2.html` and verify it shows no changes, proving all four fixes landed only in `index-v2.html`.
