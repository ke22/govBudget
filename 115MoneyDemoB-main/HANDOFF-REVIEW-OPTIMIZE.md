# Handoff — Review & optimize `index-v2.html` (LARGELY COMPLETE)

_Created 2026-07-22, updated same day · Branch: `optimize-index-frontend-perf`_

## Status: the review + the approved optimizations are DONE and pushed

The task ("review all and optimize on ui ux and coding") is substantially complete.
All four review lenses were finished (performance via agent; code-quality,
accessibility, UI/UX done **inline** on the resumed session after the agent fan-out
hit the first account's spend limit — the inline approach is what the budget lesson
below recommended). Findings were consolidated and the approved fixes shipped in
three commits on `optimize-index-frontend-perf`:

- **`dd4fd10`** — safe/mechanical: removed 3 accidental dead-CSS blocks
  (`.gantt-chart-container-rebuilt` @871, `.gantt-rows-container-rebuilt` @1017,
  redundant `.back-to-hero-btn:hover`); added font `preconnect`; dropped unused
  font-weight 300; `decoding="async"` + intrinsic width/height on the 4 `<img>`.
- **`2168b29`** — mobile hero → WebP: 3.6MB/9MP JPEG → **559K** 1200px WebP
  (~85% off the mobile LCP); + scroll hot-path: cached the 2 MediaQueryLists
  (were called 3×/frame), gated the Ch1 timeline per-card loop behind an on-screen
  check. **The scroll changes still want a human scroll-test** (all 3 chapters,
  forward+reverse) — logic-equivalent by inspection but unverifiable in this
  environment.
- Every change was brace-balance + JS-parse checked before commit.

### What remains (all by explicit user choice — NOT oversights)

- **Images beyond the hero** — user chose "hero only". The history photos
  (budget96001/96002 @2100px = 1.3M+1.5M, budget003 540K) and `paper-texture.png`
  (450K) are still full-size. Re-encoding them the same way (`cwebp -q ~72
  -resize ~1500`) would recover another ~3MB. Revisit if wanted.
- **Chart text-alternatives (WCAG 1.1.1)** — user chose "skip for now". The Gantt
  (Ch2), stacked-bar (Ch3), and Chapter-4 charts still have **zero** text
  alternative (confirmed: no `role`/`figure`/`table` anywhere). Real AT gap, left
  documented. Fix options when ready: visually-hidden `<table>`s (best) or
  `role="img"`+`aria-label` summaries (lighter).
- **`onScrollFrame` read/write batching** (perf #6) and **width→transform bar
  animation** (#10) — larger refactors, deferred; low real-world payoff on the
  already-correct rAF base.

### Verified NON-issues (don't re-chase)

- Muted-on-dark text **passes** AA (computed: `#A79C8C` on `--bg-deep` = 6.59:1,
  on `--bg-chart` = 5.73:1). The earlier "probably fails" hunch was wrong.
- All scroll listeners already `{passive:true}`; reduced-motion already
  comprehensive (universal `*` rule); one clean `<h1>`; skip-link present;
  `nav-toggle` already updates `aria-expanded` in JS; type scale disciplined
  (only 2 relative one-offs). `--np-*` tokens still actively used (not dead).
- Two computed contrast FAILs exist as raw token pairings but weren't confirmed
  in live use: `--ui-accent` on dark (2.47:1 — the bright `#E2564A` variant exists
  for on-dark and passes at 4.80) and `--ui-muted` on `--ui-paper` (1.73:1). Worth
  a grep-confirm if doing an a11y pass later, but no confirmed on-page instance.

## Why this doc exists / budget lesson

Originally created mid-task: I launched **4 parallel review agents**; only the
performance one finished before the other three hit _"You've hit your monthly spend
limit."_ **Budget lesson (proved correct on resume):** don't fan out 4 review
subagents over a 5,000-line file — do the reviews **inline** with targeted greps +
focused reads, or one agent at a time. The resumed session did exactly that and
finished all three remaining lenses cheaply.

## Task framing (unchanged)

Comprehensive review + optimization of `index-v2.html` across UI/UX and code quality. The separate live `index.html`/`database.html` are **out of scope** unless the user says otherwise. Deliver: apply the safe mechanical fixes directly; present the judgment-call / visual-dependent items as a menu for the user to choose from.

## Hard constraints whoever continues MUST respect

1. **Browser automation cannot reach `localhost` in this environment** — `chrome-error://chromewebdata/` despite `curl` returning 200, confirmed repeatedly across multiple sessions. Every finding and fix must be **derivable from reading source**; you cannot profile, axe-scan, or eyeball the rendered page. Anything needing real eyes must be flagged "needs visual check" and left for the user.
2. **This page is carefully tuned** across ~7 shipped Spectra changes. Many odd-looking things are deliberate (see `HANDOFF-v2.md`, `LEARNINGS.md`, archived specs under `openspec/changes/archive/2026-07-21-*`). Before "fixing" anything, check it isn't intentional. Frame disagreements with deliberate decisions as "reconsider X (currently intentional)" for the user to decide — don't silently revert them.
3. **Deliberate decisions not to touch blind:** Ch3 sticky-box is header-clearance-anchored (`top: var(--chart-stage-top)`, only its `align-items` was re-centered desktop-only); Ch1 timeline reveal is desktop+intermediate only (≤640 intentionally normal-flow); hero stamp is deliberately centered on mobile; heavy `!important` use is by design (scroll-driven class toggles vs base rules).
4. **Verify "dead code" by grepping before deleting.** e.g. `hero-collage-mobile.jpg` (372K) looks unreferenced in v2 but the performance agent confirmed it's used by the live `index.html` — **not dead, do not delete.**
5. **`spectra-sync-specs` is not installed** — if any of this becomes a formal Spectra change, sync specs by hand then `spectra archive <name> --skip-specs`. `.spectra/touched/<name>.json` is unreliable for `/spectra-commit` here (picks up unrelated untracked files) — stage from `git status` directly.
6. **Commit discipline:** never `git add -A`; stage only the files you touched; commit messages end with the Co-Authored-By trailer; branch stays `optimize-index-frontend-perf`.

## Correction to an earlier assumption

I told the performance agent the main scroll listener was **not** `{passive:true}`. That was **stale/wrong** — the agent verified **all** scroll listeners are already `{passive:true}` (lines ~5007/5013/5039/5096) and reduced-motion is comprehensively handled (universal `*` rule ~line 2916 kills all animation/transition). Don't chase either as a fix.

## ✅ COMPLETE: Performance review (findings preserved — do NOT re-run this one)

Foundation is solid: scroll hot path is correctly rAF-batched (one compute/frame via `scrollRafPending`), all listeners passive, reduced-motion comprehensive, no `will-change` overuse, no `background-attachment:fixed`, scripts at end-of-body. Hero art **is** served conditionally (desktop 408K ≥1025px vs mobile 3.6MB ≤1024px — only one downloads; preload `media` boundaries match the CSS cascade). **The dominant problem is asset weight, overwhelmingly the mobile hero.** Worst-case mobile first load ≈ 4.5–5.5MB before content, ~8MB after budget photos load on scroll. Hero alone ≈ 45% of mobile bytes.

| # | Sev | Location | Finding | Fix | Safety |
|---|-----|----------|---------|-----|--------|
| 1 | **P1** | `hero-collage-mobile-clean.jpg` — preload L~10, CSS L~229/3192 | **3.6MB, 2528×3562 (9MP)** served to every ≤1024px device, preloaded `fetchpriority=high` — it's the mobile **LCP** element. A phone at `cover` needs ≤~1290px wide. | Re-export ~1290–1440px wide, WebP/AVIF q78–82 → **~150–300K (~92–96% smaller)**. | needs visual check + user OK (overwrites tracked binary) |
| 2 | P2 | `budget96001/96002/003.jpg` — L~4032/4036/4041 | 1.3M+1.5M+540K, up to **2100px** wide, displayed ≤726px CSS. Lazy + absolutely-positioned (not LCP, low CLS) but ~3.4MB all fetch on entering Ch2. | Downscale ~1500px, WebP q80 → **~600K combined (~80% cut)**. | needs visual check + user OK |
| 3 | P2 | `paper-texture.png` — L~469/2306/2850 | 450K 24-bit PNG, 640×640, `repeat` bg in 3 places (incl. every `.story-card` with `background-blend-mode:multiply`). Paints once but 450K download is overhead. | Convert to WebP or a 256px seamless tile → **~30–60K (~90% cut)**. | needs visual check + user OK |
| 4 | P2 | Google Fonts — L~25–27 | Render-blocking `<link>` with **no `preconnect`**; requests **7 CJK weights** (Sans 300;400;500;700;900 + Serif 700;900); weight **300 has no usage** in the CSS. | Add `<link rel=preconnect href=https://fonts.gstatic.com crossorigin>` (+googleapis); drop `300;`. | preconnect = safe auto-fix; drop 300 = needs check |
| 5 | P2 | `updateTimelineMainLineFill` — L~4954 | **No viewport gate** — every frame reads `container.getBoundingClientRect()` and at ≥641px does `querySelectorAll('.timeline-row.item-card')` + 5× `getBoundingClientRect` + class writes even when Ch1 is far off-screen. | Early-return when `rect.bottom<0 || rect.top>innerHeight` (after the one rect read). | needs light check |
| 6 | P2 | `onScrollFrame` — L~4996 | **Forced sync layout**: Ch2 (writes) → Ch3 (reads→writes) → timeline (reads→writes); each function's reads flush the prior's writes → ~2–3 forced reflows/frame. Loops small (5+14 nodes) so moderate, not catastrophic. | Batch all rect reads first, then writes (or cache rects). | needs user decision (refactor) |
| 7 | P3 | `updateHistoryExit` — def L~4719, called L~4883 | Runs unconditionally every frame (2 rects + writes) even when Ch2 nowhere near viewport. Comment says deliberate for scroll-jumps — **verify intent**. | Cheap proximity gate before the rect reads. | verify intent / user decision |
| 8 | P3 | Hot path — L~4707–4712/4785/4872/4890/4900/4977 | Static-DOM `querySelector`/`getElementById` re-run every frame (`.gantt-container-rebuilt`, `[data-rebuilt-step="9"] .story-card`, `.chapter-intro`, card lists). DOM never changes. | Resolve once after DOMContentLoaded, cache in closure consts. | safe auto-fix (light check) |
| 9 | P3 | Hot path — L~4726/4770/4905 | `matchMedia(...)` called 3–4×/frame. | Create the `MediaQueryList` objects once, read `.matches`. | safe auto-fix |
| 10 | P3 | `#ch3-bar-total-grey` L~1535; also L~885/913 | Transitions animate **`width`** (layout) + `box-shadow`/`bg`/`border` (paint), not compositor-friendly. One-shot on a few bars — bounded. | Optional `transform:scaleX` + counter-scale (distorts content — real rework). | user decision |
| 11 | P3 | `<img>` L~3605/4032/4036/4041 | No `width`/`height`, no `decoding="async"`/`fetchpriority`. CLS risk **low** (budget imgs are `position:absolute` in a fixed stage; nav-logo tiny) — hygiene, not a real bug. | Add `decoding="async"` + intrinsic `width`/`height`. | safe auto-fix (low impact) |

**Highest leverage = #1** (one re-export ≈ −3.3MB ≈ 40% of mobile weight, direct LCP win). #2–#4 recover ~3.6MB more. JS findings #5–#9 are real but second-order given the tiny loops on an already-correct rAF/passive/reduced-motion base.

## Independently confirmed (by me, not the agent)

- **Image tooling IS available** on this machine: `/usr/bin/sips` (built-in downscale/re-encode), `/opt/homebrew/bin/cwebp`, `/opt/homebrew/bin/avifenc`, `/opt/homebrew/bin/ffmpeg`. `magick`/`convert` are NOT installed.
- **Exact dimensions:** `hero-collage-mobile-clean.jpg` 2528×3562 (3.6M) · `hero-collage.jpg` 1400×933 (408K, desktop) · `hero-collage-mobile.jpg` 851×1200 (372K, used by live index.html — keep) · `budget96001.jpg`/`budget96002.jpg` both 2100×1395 (1.3M/1.5M) · `budget003.jpg` 1080×720 (540K) · `paper-texture.png` 640×640 (450K).
- **The mobile hero is a CSS `background-image`**, not an `<img>` — so shrinking it needs the file re-encoded (or an `image-set()`/media swap), not width/height attrs. The `width`/`height`/`decoding` hygiene fix (#11) applies only to the 3 `<img>` history photos + nav logo.

### ⚠️ Image-optimization decision the user must make first
Re-encoding/downscaling **overwrites committed binary assets** and is lossy/irreversible at the source level (git history keeps old blobs, but 9MP→~1MP throws away detail). Do **not** overwrite blind. Ask the user to approve before running any `sips`/`cwebp` on tracked images. Also, without a working browser here you can't confirm the re-encoded image looks acceptable — the user may want to eyeball it. Suggested safe approach if approved: produce optimized copies, update references, keep originals recoverable via git.

## ⏳ PENDING: re-run these 3 review lenses (they died on the spend limit)

Each had read the file and was mid-verification when killed. Re-do them (inline preferred, to save budget). Scope of each:

1. **Code quality & dead code** — accidental CSS duplication (same selector, **same** cascade context, declared 2×, later silently winning — e.g. `.gantt-chart-container-rebuilt` appears declared twice in the base cascade; verify); genuinely dead CSS classes/`--np-*` tokens superseded by `--ui-*` (grep to confirm before calling dead); dead `data-*`; long inline `style="..."` on the several `.chapter-intro` blocks (dup'd markup); duplicated logic between `updateChapter2Stage`/`updateChapter3Bars`; comment-vs-code drift. **Distinguish intentional media-query overrides (leave) from accidental redeclaration (fix).**
2. **Accessibility (WCAG)** — compute real contrast ratios from `:root` tokens (`--ui-muted` #A79C8C and `--np-*-ondark` on dark are the prime suspects for AA fails on caption/legend/chart-label text); **the Gantt & stacked-bar charts almost certainly have no text alternative** (likely a real 1.1.1 failure — assess and propose `aria-label`/`role="img"`/visually-hidden table); heading order / landmarks / skip-link; hamburger + back-to-hero accessible names / `aria-expanded` / focus; confirm reduced-motion covers **every** reveal (it appears to via the universal `*` rule — verify the pulsing "?" and bar growth included); `focus-visible` styles.
3. **UI/UX & responsive** — type-scale consistency (one-off font-sizes bypassing `--type-*`?); spacing rhythm (ad-hoc magic numbers?); breakpoint completeness across 640/968/1024/1025/1340 (any width band inheriting wrong rules? what do 968 & 1340 cover?); touch targets <44px (nav links, hamburger, back-to-hero, CTA, legend items); hover-only affordances unreachable on touch (`.story-card:hover`, `.timeline-row.item-card:hover`); shadow/border/radius vocabulary sprawl. Mark visual-dependent items "needs visual check".

Consolidate all four lenses into one deduped, severity-ranked plan; apply "safe auto-fix" items (with a CSS brace-balance check + JS `new Function()` parse sanity check before committing — the pattern used all session); present the rest as a menu.

## Suggested next-session sequence

1. `git status` (confirm clean) → read `HANDOFF-v2.md` + this file + `LEARNINGS.md`.
2. Re-run the 3 pending reviews (inline / one agent at a time — mind the budget).
3. Ask the user to approve image optimization (biggest win, but overwrites binaries + can't visually verify here).
4. Apply the confirmed **safe auto-fixes** (font preconnect, cache static DOM lookups + matchMedia in the scroll closure, timeline off-screen early-return, `decoding=async`+intrinsic dims on the 3 imgs, any confirmed accidental-dup / dead-code removals) → brace/parse check → commit scoped → push.
5. Present remaining judgment calls (chart text-alternative approach, contrast token tweaks, `onScrollFrame` read/write batching refactor, width→transform bar animation, dropping font weight 300) as a menu.

## Related
`HANDOFF-v2.md` (overall -v2 workstream state — all triage buckets shipped/handed off), `ISSUE-TRIAGE-v2.md`, `LEARNINGS.md`, archived changes under `openspec/changes/archive/2026-07-21-*`.
