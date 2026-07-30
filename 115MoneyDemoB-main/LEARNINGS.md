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

## 10. `mask-image: url(...)` on an external SVG silently fails over `file://` — inline the SVG instead

**問題**：把 header 裡的 CNA 圖示從 `<img src="...svg">` 改成 `background-color` + `mask-image: url('cna-logo.svg')` 想讓圖示顏色跟著標題文字變，結果使用者直接用瀏覽器開啟本機檔案（`file://` 而非 `http://`）時，圖示整個消失——不是顯示成破圖，是完全不可見，比原本的 `<img>` 還更難察覺是壞掉。
**原因**：多數瀏覽器對 `mask-image`/`-webkit-mask-image` 參照外部 SVG 資源時，在 `file://` 協定下會拒絕載入（視為需要 CORS 驗證的外部資源，即使是同目錄下的檔案），而且失敗後沒有任何 fallback：mask 定義了元素的可見範圍，遮罩圖載入失敗＝可見範圍是空的＝整個元素完全不渲染，不像 `<img>` 壞圖至少有裂圖示或 alt 文字可以看出異常。
**解法**：需要用 CSS 變數控制顏色、又要在 `file://` 下也能穩定顯示的裝飾性圖示，改成把 SVG 的 path 資料直接內嵌進 HTML（`<svg fill="currentColor">...</svg>`），用 `color` 屬性控制顏色，不再對外發任何請求。同一份 path 資料如果要跨頁重複使用，就是複製貼上到每個檔案裡，沒有更輕的做法能同時滿足「CSS 控色」+「`file://` 穩定」兩個條件。驗證方式：本機起 `python3 -m http.server` 測試不算數（那是 `http://`），要嘛實際用瀏覽器開啟本機檔案路徑測試，要嘛就假設任何用到 `mask-image`/`background-image` 參照外部檔案的裝飾元素在 `file://` 下都不可信。

## 11. Hero 標題烘焙在圖片裡時，`background-size: 100% auto` 只跟著寬度縮放，跟疊在上面的絕對定位面板沒有共同基準

**問題**：`index-v2.html` 桌機版的 hero 標題（`.hero-title`）其實是 `.hero-sr-only`（畫面上看不到，只給螢幕閱讀器），視覺上看到的標題文字是直接畫在 `hero-collage-v2.jpg` 裡的。疊在圖片上方的 `.hero-dek-panel` 用固定 `bottom: 160px` 定位，結果在不同視窗「高度」下，面板跟圖片裡標題的視覺間距會跑位——改視窗寬度沒事，改高度就跑位。
**原因**：`.hero-section` 的背景圖用 `background-size: 100% auto`（寬度撐滿、高度依圖片原始比例自動算），再用 `background-position: center center` + `overflow: hidden` 垂直置中裁切。圖片在畫面上實際落點只跟「容器寬度」有關；而 `.hero-dek-panel` 的 `bottom: 160px` 只跟「容器高度」有關（是從容器底部往上量固定像素）。兩個疊在一起的視覺元素分別鎖定寬度、高度兩個不同的軸，容器長寬比一變，兩者的相對關係就不再固定。
**解法（部分解，非物理精確解）**：沒有把圖片改成固定長寬比容器（`aspect-ratio` + 類 `object-fit` 排版，改動較大，這次使用者選擇不做）的情況下，把面板的 `bottom` 從固定 px 改成該容器自身高度的百分比（例如 `bottom: 35.5%`，用某個參考視窗高度反推出來的值），至少讓留白「隨視窗高度等比縮放」，而不是視窗一變高留白就顯得過大／過小。這只是讓跑位幅度變小，不是让面板真正物理貼齊圖片裡的標題座標——要做到後者，一定要先讓圖片本身的顯示尺寸變得可預測（鎖定比例的容器），沒有其他更輕的做法。

## 12. 第二章退場的錨點同時決定第三章開場文字何時淡入（跨章節隱性耦合）

**問題**：把第二章的退場動畫錨點從「卡片 9 的字卡」改到「章節尾端的捲動跑道」之後，第三章的開場標題（`晚審影響／新興預算無法動支`）與導言變成**整段空白飄過、完全沒淡入**，讀者直接撞上第三章圖表。這次改動一行都沒動到第三章的程式碼。
**原因**：第三章開場文字的淡入不是自己判斷捲動位置，而是掛在第二章的退場完成訊號上——`chapter3Intro.classList.toggle('chapter3-intro-revealed', stage.classList.contains('history-exit-complete'))`（`index.html` 的 `updateHistoryExit` 內），CSS 是 `.js #chapter-3-rebuilt .chapter-intro` 的 `opacity:0 → 1`、`transition: 0.5s`。而**跑道底緣就等於第三章頂端**（跑道是第二章最後一個元素，實測 `runwayBottom === chapter3Top`），所以退場門檻改成相對跑道底緣量之後，等於同時把「第三章開場文字何時開始淡入」往後推。改動前桌機是靠 `chapter3Top <= viewportHeight` 這條硬門檻先觸發，開場文字在第三章還從畫面下方進場時就解鎖，有將近一個畫面高的捲動距離可以慢慢淡入；改動後退場完成延到 `chapter3Top ≈ 171px`，開場文字只剩 191px 就要捲出畫面上緣，0.5s 的淡入根本跑不完。
**解法**：把「保護圖片3的停留時間」與「相對第三章何時退場」拆成兩個各自獨立的旋鈕，不要共用一個門檻——
- 跑道高度（`.ch2-final-runway`）只決定圖片3單獨佔畫面多久；
- `updateHistoryExit` 的 `start`/`end`（現為 `0.95` / `0.70` 視窗高）只決定舞台相對第三章何時收，讓整段淡出都發生在第三章還沒進入閱讀區之前，開場文字就拿回約 0.7 個畫面高的淡入餘裕。

改這一段時務必連帶檢查第三章開場文字（量 `introTop` 在解鎖那一刻離視窗頂端還有多遠，至少要留 0.5 個畫面高），否則會做出「第二章看起來對了、第三章開頭卻消失」這種很難聯想到成因的迴歸。

## 13. 固定舞台的「最後一個視覺元素」需要自己的捲動跑道，否則永遠來不及被看到

**問題**：想做「字卡捲走後，第三張大結局照片才單獨出現」，於是把照片的顯示條件綁在「字卡已捲出視野」。結果照片**完全沒出現過**。
**原因**：第二章的退場淡出本來就錨定在同一張字卡上，且在 `top <= 0.20vh` 就已經 `visibility:hidden` 收完；而「字卡捲出視野」（`bottom <= 0.35vh`）比它更晚才成立。照片解鎖的那一刻，舞台早就關燈了。字卡是章節最後一個元素，它捲走的同時章節就結束——**「字卡走完」和「章節退場」之間沒有任何捲動距離**。
**解法**：在最後一張卡片後面補一段純空白的捲動跑道（`#ch2-final-runway`，`105svh`，刻意與一張故事卡 `--scene-read-interval` 同量級，讓這一拍與其他敘事節拍等重），並把退場錨點改到跑道底緣。三個容易漏掉的細節：
1. 跑道**不要**用 `.gantt-card-rebuilt` class，否則會被手機版的步驟判斷（`cards.forEach`）當成第 10 張卡片、也會被 `scenes` 的 `IntersectionObserver` 抓進去 `is-active` 輪替。用獨立 class 並加 `aria-hidden="true"`。
2. 桌機版步驟是**整章捲動百分比**制（`20/30/…/84%`），章節一變高，所有門檻的實際落點就整批位移。要把跑道高度從除數裡扣掉（`rect.height - runwayHeight - innerHeight`），讓原有門檻維持原本語意；跑道區間內 `scrollPercent` 會超過 100，由最後的 `else` 收成 step 9。
3. 檢查有沒有「第三章一露頭就強制退場」這類硬門檻（本例是 `chapter3Top <= viewportHeight`）。跑道底緣等於第三章頂端，這種門檻會比淡出區間**更早**成立，直接把舞台瞬間關掉、跑道等於白做。本例改成 `chapter3Top <= 0`，讓它退回單純的大跳躍保險。

## 14. 本機 `localhost` 瀏覽器自動化可用，但被節流的分頁量到的數字會是假的

先修正舊紀錄：`file://` 確實被擋（"Can't interact with browser-internal or unparseable URLs"），但 `python3 -m http.server` + `http://localhost:PORT` **可以正常導航與操作**，這條路是通的。

真正的陷阱是分頁沒有真正在前景繪製時，量測結果會**安靜地錯**：
- **`requestAnimationFrame` 不會觸發** → 所有 rAF 節流的捲動處理器（本頁的 `onScrollFrame`）在 `scrollTo()` 之後根本沒跑，class 完全沒更新。要嘛直接呼叫 `onScrollFrame()`，要嘛別相信結果。`await new Promise(r=>requestAnimationFrame(r))` 會直接掛住到 CDP 45s timeout。
- **CSS transition 不會前進，而 `getComputedStyle` 會回傳過期值** —— 不是回傳「轉場起點」這麼單純。實測出現過三個相框的 `opacity` 與 cascade **完全相反**（規則明明只有 base `0 !important` 和 `.rebuilt-step-8 … nth-child(2) {1 !important}`，量到的卻是 2 號 `0`、3 號 `1`，剛好是上一個狀態的殘影）。也就是說：**枚舉 CSSOM 規則確認「誰該勝出」是可信的，`getComputedStyle` 的實際值不可信。**
- **`resize_window` 改不動 layout viewport** → `outerWidth` 變了但 `innerWidth` 仍是 1920、`matchMedia('(max-width:1024px)')` 仍是 `false`，**手機版在這個環境量不到**，只能靠推理，要在 handoff 明講未驗證。

可信的兩種訊號：
1. **DOM class / JS 寫進去的 inline 值**（如 `stage.style.getPropertyValue('--history-exit-opacity')`）——這些是 JS 直接寫的，不經過樣式重算，掃描一整段捲動範圍拿門檻很準；
2. **截圖**——截圖會強制真正繪製一次，是唯一能確認「肉眼看到什麼」的方法。

實務作法：用 `scrollTo()` + 直接呼叫捲動處理器 + 讀 class/inline 值，掃出各個門檻的精確捲動位置；再對關鍵的兩三個位置各截一張圖確認視覺。別用 `getComputedStyle` 的 opacity 下結論。

## 21. 量測多行 HTML 標籤的屬性，單行 grep 會漏掉換行後的內容

**問題**：做效能建議時，用 `grep -c 'width='` 掃 `<img` 那一行，回報「3 張圖全部沒有 width/height」。實際上這三個 `<img>` 標籤本來就有 `width`/`height`，只是屬性寫在**換行後的第二行**（`<img src="..." alt="..." loading="lazy"\n    width="2100" height="1395">`），單行 grep 天生看不到下一行的內容。這個錯誤的發現後來寫進了給使用者的優化建議報告，等到真的要動手修才發現量錯了。

**原因**：`grep` 預設逐行比對，多行 HTML 標籤（尤其是屬性多到要換行的）在文字上被切成好幾行，任何「只看這一行」的規則都會系統性漏掉下一行的內容。這種漏測不會報錯，看起來就是「找不到就是沒有」，很難自己發現。

**解法**：量測跨行的 HTML 結構時，要嘛 `grep -A2`/`-A3` 帶上下文一起看，要嘛乾脆用 `python3` 把整個檔案讀成字串，用能跨行比對的 regex（如 `re.DOTALL` 或直接抓 `<img[^>]*>` 但用 `re.S`）。凡是「用 grep 確認某個屬性不存在」的結論，多留一個心眼——先確認自己有沒有可能漏看了下一行。

## 22. WebP 格式協商用兩條 `background-image` 宣告，比 JS 特徵偵測更簡單

**問題**：想幫 CSS `background-image` 換成 WebP 省流量，但又不想在完全不支援 WebP 的瀏覽器上讓圖片直接消失（`url()` 找不到格式支援與否的判斷機制，不像 `<picture>` 有格式協商）。

**解法**：寫兩條 `background-image` 宣告，後面那條用 `image-set()`：

```css
background-image: url('x.jpg');                                          /* 保底 */
background-image: image-set(url('x.webp') type('image/webp'), url('x.jpg') type('image/jpeg'));  /* 實際採用 */
```

不支援 `image-set()` 的瀏覽器會把第二條宣告**整條**視為無效值並丟棄，自動保留上一條合法的 `url()`——這是 CSS 對無效宣告的標準行為（invalid at computed-value time 的屬性不會讓整個 rule 失敗，只丟該條宣告），不需要 JS 特徵偵測、不需要維護兩份 class。唯一要注意的是同一個 `background-image` 屬性如果是多層背景（例如疊了 `radial-gradient` 網點紋理），兩條宣告都要把**所有圖層**完整列出，只換其中一層、其他層用同樣寫法照抄，不能只寫要換的那一層。

**這個技巧不適用**社群媒體爬蟲會讀的 `<meta property="og:image">`／`twitter:image`／JSON-LD 的 `image`——那些是外部程式直接抓 URL，没有 CSS fallback 機制保護，WebP 支援度在各家爬蟲上不一致，這幾處刻意維持 JPEG 不動。

## 23. 固定「兩排」排版要用 explicit `<br>`，不能靠 wrap 自然換行；還原前一個 style commit 優先用 `git revert`

**問題**：footer 的「製作」credit 原本是 7 個人名逗號分隔的一整行，後來被改成每人一行（`display:block`），使用者要求先改回原樣、再改成固定兩排（4 名＋3 名）。

**原因／作法**：
- `.credit-name` 本身有 `white-space: nowrap`，但外層 `dd` 沒有，所以本來就會隨容器寬度自然換行——但换行點會跟著螢幕寬度浮動，不是「固定兩排」。要做「不管螢幕多寬都固定在同一個斷點」，唯一可靠的做法是在指定的兩個 `<span>` 之間插入一個 explicit `<br>`，不要依賴 `flex-wrap`／natural wrap 或猜測容器寬度。
- 還原「stack one-per-line」那個 commit（`d431baa`）時用 `git revert <sha>` 而不是手動把 markup 改回逗號分隔——那個 commit 同時還夾帶了 `line-height`／`nowrap` 的調整（為了讓 `dt`/`dd` 第一行基線對齊），手動只改 markup 很容易漏掉這些一起 revert，`git revert` 保證整個 commit 的所有改動（CSS + markup）一起乾淨地退回去。
- 這個 credit block 有 **4 份實體檔案**要同步改：`index.html`、`database.html`，以及 `115MoneyDemoB-main/` 底下的兩份鏡像。四份逐一手動改容易漏掉一份造成兩頁不一致，用小腳本（例如 python 對 4 個路徑跑同一個字串替換＋`assert count==1`）比逐檔手改可靠。
