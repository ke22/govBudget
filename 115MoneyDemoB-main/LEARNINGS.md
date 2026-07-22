# Learnings — `index.html`

Non-obvious things discovered while optimizing this file. Read before editing.

## 1. Two chapter architectures; the legacy mobile CSS is mostly dead code
The live page uses the **"rebuilt" chapters**: chapter-2 = `.gantt-fixed-stage-rebuilt`
(`position:fixed`), chapter-3 = `.gantt-sticky-box-rebuilt` (`position:sticky`).
Chapter-1 uses a `mobile-timeline-badge` (chart hidden on mobile) and chapter-4 stacks
in normal flow (`.dynamic-chart-box` inline). The first `@media (max-width:968px)` block
(~index.html:1704) targets legacy `.local-sticky-stage` / `.step-scene` / `.dynamic-chart-box`
classes that **chapters 1 & 4 no longer use** — editing it does mostly nothing. Add mobile
rules to the dedicated rebuilt-chapter block instead.

## 2. Don't convert the bars to `transform: scaleX/scaleY`
Every animated bar (`.gantt-bar-rebuilt` 2px, `.ch3-single-bar-layer` 8px radius,
`#timeline-progress-bar`) has a `border-radius`; scaling **distorts the rounded corners**
(breaks pixel fidelity). And the bars animate only on **discrete step transitions**, not
per scroll frame — re-setting the same `width` each frame is deduped by the browser, so
there's ~no per-frame layout cost to remove. The scroll perf win comes from the
rAF+passive handler, not from touching the bars. Keep bars on `width`/`height`.

## 3. The Gantt is absolutely-positioned with a hardcoded px frame
`.gantt-rows-container-rebuilt`, `.gantt-grid-rebuilt`, `.gantt-x-axis-rebuilt`,
`.gantt-red-deadline-stage` all share `left:80px / right:30px / bottom:100px` (Y-axis gutter
+ X-axis gap). The red deadline line (`left:35.3%`) and execution zone (`left:40%`) are
**percentages inside that frame**. To resize for mobile you must override `left/right/top/
bottom` **identically on all frame elements** so the percentages stay aligned — change one
and the red line drifts off the grid.

## 4. Two different step-trigger mechanisms — sync behaves differently
- **Chapter-3** (`updateChapter3Bars`) picks the step from **card position**:
  `cardTop <= containerTop + offset`. Tunable — on mobile the offset must be ~the band
  height (`0.6×innerHeight`) so a card counts only once it's in the visible reading zone,
  else the animation fires while the card is still hidden behind the pinned band ("animation
  before/after text").
- **Chapter-2** (`updateChapter2Stage`) uses a **global `scrollPercent`** with fixed
  thresholds (12/24/…%) — NOT tied to card position, so it's the fragile one for mobile
  sync. If text/chart drift, gate a threshold nudge behind `matchMedia('(max-width:968px)')`.

## 5. Mobile "pinned top band" pattern that guarantees no overlap
Make the pinned chart stage an **opaque** top band with `z-index` **higher than the cards**.
Cards scrolling into the top region are simply covered → overlap is impossible in every
step, without per-card math. It's invisible during the intro because the page background is
white (`--bg-deep: #FFFFFF`) — only reveal the divider line once the chart appears
(`.rebuilt-step-2`). For photo-only steps, let the same stage grow to `100dvh` for a
full-bleed image with the caption overlaid.

## 6. `dvh` over `vh` for pinned mobile stages
Always pair `height: 100vh; height: 100dvh;` (vh first as fallback). Plain `vh` makes pinned
stages jump when the mobile browser address bar collapses/expands.

## 7. One SVG can't be both the dark-mode-aware favicon and the fixed-background nav logo
**問題**：把 `@media (prefers-color-scheme: dark)` 加進 `cna-favicon-light.svg` 讓瀏覽器分頁圖示變色沒問題，但同一個檔案也被 header 裡的 `.nav-logo <img>` 拿來用——那顆圖示的底色是寫死的淺色圓形色塊（`--np-paper-panel`），跟系統深色模式無關。使用者若把 OS 切成深色模式，nav-logo 的 icon 會跟著切成淺色，疊在同樣淺色的底色塊上直接消失。
**原因**：`<img src>` 和 `<link rel="icon">` 載入的 SVG，內部 `@media (prefers-color-scheme)` 一律照瀏覽器/OS 的偏好設定解析，跟該圖片實際被塞進什麼背景色的容器無關。同一份檔案只要有兩個用途、背景色分別是「固定淺色」和「跟著瀏覽器分頁走」，就不可能用單一 media query 兩邊都對。
**解法**：拆成兩個檔案 —— 保留原本純色版 `cna-favicon-light.svg`（fill 固定 `#4a4a4a`）給背景色已知固定的用途（nav-logo 用），另存一份 `cna-favicon-adaptive.svg` 加上 dark-mode media query，只給 `<link rel="icon">` 用（唯一背景真的會隨系統深色模式變化的地方）。

## 8. Sibling filter functions silently search different fields on the same dataset

**問題**：database.html 的「主題篩選」裡，試算表定義的三個主題只有「國防安全」篩得出結果，另外兩個（新興計畫、718億先行動支方案）永遠是空的——看起來像主題分頁沒接上試算表，但實際上 fetch 有成功、`themeKeywords` 也正確載入三筆。
**原因**：`matchThemeCheck()` 只搜尋 `計畫名稱` + `工作內容`；而給關鍵字搜尋框用的 `matchKeywordCheck()` 多搜了 `主管機關` + `關鍵字`。試算表裡「新興計畫」「718億先行動支方案」這兩個標籤其實只標在每筆計畫的 `關鍵字` 欄位，不會出現在名稱或工作內容裡，所以只搜前兩欄位的 `matchThemeCheck` 永遠比對不到。「國防安全」能過純屬巧合——它的關鍵字（國防部、軍事…）剛好也是常出現在計畫名稱/工作內容裡的字。兩個篩選函式各自維護一份欄位清單、沒有共用來源，改一邊很容易漏改另一邊，而且不會有任何錯誤或警告浮現。
**解法**：把 `matchThemeCheck` 的搜尋欄位補齊到跟 `matchKeywordCheck` 一致（加上 `關鍵字`）。驗證時直接用 python 抓 gviz JSON、套用同樣的篩選邏輯逐筆算，三個主題筆數都要 >0 才算過關，不能只看畫面有沒有跳錯誤。

## 9. 用 `git show branch:path > file` 搬移分支內容時，只會拿到已 commit 的版本，漏掉尚未 commit 的修改

**問題**：把 feature branch（optimize-index-frontend-perf）的頁面內容同步回 main（正式站）時，第一次同步完後才發現有一個剛做完但還沒 commit 的顏色修正（#006064 → var(--np-seal-red-dark)）沒有一起帶過去，導致正式站短暫又跟 feature branch 不一致，得再跑第二次同步。
**原因**：搬移時用 `git show <branch>:<path> > <file>` 直接讀取該分支「已提交」的 blob 內容，這個指令不會反映當下 working tree 裡尚未 commit 的變更；當時那個顏色修正還停留在 working tree（`git status` 顯示 M），尚未 commit，所以完全沒出現在同步結果裡。
**解法**：用 `git show` 或任何讀「已提交內容」的方式跨分支搬移檔案之前，先確認來源分支工作目錄是乾淨的（`git status --short` 無輸出）；有未提交的修改就先 commit（或先跟使用者確認要不要一併帶入），再同步，並在同步後逐行核對 diff 內容是否等於預期變更，而不是只看行數。
