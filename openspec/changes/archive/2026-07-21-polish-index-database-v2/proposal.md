## Summary

Fix 21 user-reported layout, timing, copy, and interaction issues on the CNA budget-review report page and its companion database page, working entirely on new duplicate files so the live pages are unaffected until reviewed.

## Motivation

A round of user feedback against the deployed `115MoneyDemoB-main/index.html` (報導頁) and `115MoneyDemoB-main/database.html` (資料庫頁) surfaced a mix of real defects and desired content/interaction changes. During `/spectra-discuss`, three items flagged as "might be RWD bugs" were verified live in a mobile-emulated browser against the local dev server, with concrete root causes found for two of them and one confirmed as already-working:

- Mobile Chapter-2 card 1 ("回顧歷年審查歷程...") is permanently invisible on mobile because the `@media (max-width: 968px)` block defines visibility-toggle rules for `.rebuilt-step-2` through `.rebuilt-step-9` but has no `.rebuilt-step-1` rule at all.
- The mobile timeline card "left-right wobble" is not a timeline bug: `document.body.scrollWidth` is 31px wider than the viewport site-wide, traced to a `white-space: nowrap` `.val-num` label in Chapter 4's comparison chart (`.pyramid-align-row .bar-group.right-bar-box .val-num`) overflowing its 66px-wide container near the right edge of a mobile viewport.
- The mobile header hamburger menu (missing 資料庫/接頁 buttons, per the user's report) was tested live and works correctly — all three nav links render, are correctly sized, and are unobstructed. No code change is needed there; it is called out in tasks only as a "re-verify on device" step, not a fix.

The remaining items are grounded directly in the current markup/CSS/JS (see file:line references in each task) rather than guessed.

## Proposed Solution

All work happens on **new duplicate files**, `115MoneyDemoB-main/index-v2.html` and `115MoneyDemoB-main/database-v2.html`, created as exact copies of the current `index.html`/`database.html`. Every fix below is applied to the `-v2` files only; the live `index.html`/`database.html` are not touched by this change. The user will review the `-v2` pages and decide separately when/how to promote them to production (out of scope here).

**報導頁 (`index-v2.html`)**

1. Swap the header nav order (both `index-v2.html` and `database-v2.html`, for consistency) from 年度深度報導 → 總預算案專頁 → 完整資料庫 to 年度深度報導 → 完整資料庫 → 總預算案專頁.
2. Remove the 逾期/警示/付委 circular `::after` badges on `.timeline-block-node.node-danger/-warning/-success`, keeping the existing colored left-border card styling.
3. Fix the hero title/dek-panel/stamp overlap: `.hero-section`'s `background-size: 100% auto` makes the visible crop of the baked-in title shift vertically across different desktop/laptop aspect ratios, while `.hero-dek-panel` (`bottom: 160px`) and `.hero-stamp-wrap` (`top: 110px; right: 6%`) use fixed offsets that don't track that shift — causing the stamp to overlap the dek-panel on some screens. Adjust the stamp's positioning strategy so it stays clear of the dek-panel and reads as closer to center across common desktop/laptop aspect ratios (16:9, 16:10, ultrawide), not just today's two breakpoints.
4. Tighten the Chapter-2 chart-to-card sync: chart step visibility is currently gated on `.gantt-card-rebuilt.is-active`, set by an `IntersectionObserver` with `rootMargin: '-10% 0px -20% 0px'` — too deep a trigger band, causing the chart to visibly lag behind card 2's text. Reduce the trigger band so the chart updates as the card becomes readable.
5. Nudge `.gantt-fixed-stage-rebuilt`/`.gantt-chart-container-rebuilt` desktop padding down slightly so the 96年度 axis label is not crowded against the fixed header on laptop-height screens.
6. Card 3 text: 立時 → 歷時.
7. Card 4 text: replace with "紅色的虛線是法律規定預算審理完成時間，淺灰色的區塊則代表預算應該開始執行的時間" (also corrects 深灰色 → 淺灰色).
8. Card 5 text: replace with "蔡英文執政8年間只有1次（113年度）在時限內完成審議，更早的馬英九執政時期也僅有2次（101年度及105年度），大部分都是到隔年2月前才完成審議。"
9. Add the missing `.rebuilt-step-1` mobile visibility-toggle rule (following the exact pattern of the existing `.rebuilt-step-2` through `.rebuilt-step-9` rules) so Chapter-2 card 1 becomes visible on mobile.
10. Scale the mobile Chapter-2 chart down by roughly 5% so it is not clipped under the fixed header.
11. Replace the mobile Chapter-2/3 card opacity/visibility fade (cards currently pinned dead-center via `align-items: center; justify-content: center` and faded in place) with a translate-based bottom-to-top slide, driven by the same step class, to match desktop's natural scroll-flow motion. Apply this to every step, including the step-9 card (which currently disappears abruptly together with its photo) so it slides up and exits off the top of the screen instead.
12. Chapter-2 closing paragraph: replace with "這些項目因為預算遲未審查而無法使用，雖然補助等經費可以在總預算三讀後回溯發放，但凡涉及工程等費用，可能因為執行期不足而導致經費無法發揮使用，最終剩餘沒有執行的錢仍須回歸國庫，不能留到明年繼續沿用。"
13. Chapter-3 first paragraph: replace with "前述提到，受預算法規定，在總預算未審議前，新興資本支出及新增計畫原則上不能動用。"
14. Reverse the footer CTA order: the two closing paragraphs ("隨著總預算付委..." / "115年度總預算正在審議...") now come first, followed by both buttons at the very bottom of the section (opposite of the current order).
15. Fix the mobile-wide horizontal-scroll ("timeline wobble"): contain/reposition the `white-space: nowrap` `.val-num` label in every `.pyramid-align-row .bar-group.right-bar-box` in Chapter 4 so none of them ever push `document.body.scrollWidth` past the viewport width on mobile.

**資料庫頁 (`database-v2.html`)**

16. Remove the "第一步："/"第二步："/"第三步：" label prefixes from the three filter section headers, keeping the icon and the rest of each label.
17. Add a real desktop scroll interaction to `.pill-row` (部會篩選): it currently has `overflow-x: auto` but a hidden scrollbar (`scrollbar-width: none` plus a hidden webkit scrollbar) and no drag-to-scroll handler, so desktop mouse users cannot reach ministries hidden past the visible edge. Add a mousedown-drag-to-scroll handler (or equivalent pointer-based interaction) so desktop users can reach the full pill list.
18. Remove the total-amount display (`#summary-amount`) that currently sits next to "符合條件共 XX 筆計畫", keeping only the count text.
19. Render each project's `關鍵字` column value (already fetched live from the Google Sheet, already used for filtering, never displayed) as small tag chips on its `.project-block` card, split on the Chinese comma `、`, reusing the existing `.pill-btn` visual language for consistency with the filter pills. Tag data must stay bound to the live spreadsheet fetch — no hardcoded tag lists.

## Non-Goals (optional)

- Promoting `index-v2.html`/`database-v2.html` to replace the live `index.html`/`database.html` — that swap is a separate, later decision by the user and out of scope for this change.
- The mobile header hamburger menu (資料庫/接頁 buttons) — verified already working correctly in current code during `/spectra-discuss`; only an on-device re-verification task is included, no fix.
- Any redesign of the underlying data-fetch pipeline for `database.html` (Google Sheets `gviz` JSON) — the keyword-tag capability reuses the existing fetch and `關鍵字` field as-is.
- Any changes to `.history-img-frame-single` or other already-known dead CSS unrelated to this feedback list.

## Capabilities

### New Capabilities

- `project-card-keyword-tags`: `database-v2.html` project cards display keyword tags sourced from the live spreadsheet's `關鍵字` column.
- `desktop-pill-row-scroll`: `database-v2.html`'s theme/ministry pill rows are reachable by desktop mouse users via a drag-to-scroll interaction, not just an overflow hint.
- `mobile-scrollytelling-card-motion`: `index-v2.html`'s mobile Chapter-2/3 story cards enter and exit via a bottom-to-top slide synced to the active scroll step, instead of an in-place opacity fade.

### Modified Capabilities

(none)

## Impact

- Affected specs: project-card-keyword-tags, desktop-pill-row-scroll, mobile-scrollytelling-card-motion
- Affected code:
  - New: 115MoneyDemoB-main/index-v2.html, 115MoneyDemoB-main/database-v2.html
  - Modified: (none — index.html and database.html are not touched by this change)
  - Removed: (none)
