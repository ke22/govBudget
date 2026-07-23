# Handoff — `index-v2.html` chapter-3 mobile pass & cascade learnings

_Written 2026-07-23 · Branch: `optimize-index-frontend-perf` · Scope: `115MoneyDemoB-main/index-v2.html` only_

> This is a **learnings** document, not a changelog. It records the four
> failure classes that cost the most time in this session so the next person
> recognises them in minutes instead of hours. See `HANDOFF-v2.md` for the
> wider -v2 workstream context and its own open actions.

> ⚠️ `HANDOFF-v2.md` warns that **another Claude Code session edits this same
> file on this same branch and checkout concurrently**. That was confirmed
> again this session (an Edit tool call reported the file had changed on disk).
> Re-read before editing, and verify your own changes survived before you commit.

---

## 1. The cascade trap: `≤640` and `≤968` blocks sit BEFORE `≤1024`

**This is the single most expensive bug class in this file. It bit four times
in one session, including once where I had already written the warning down.**

The stylesheet has media blocks in this source order:

| Block | Opens near line |
|---|---|
| `@media (max-width: 640px)` | 224 |
| `@media (max-width: 968px)` | 2250, 2311, 2651 |
| `@media (max-width: 1024px)` | 3263 |
| `@media (max-width: 640px)` | 3522 |

A phone at 390px matches **all** of them. Same selector + same specificity
means **later source order wins**. So a rule written in the `≤640` block at
line 224 is silently overridden by the `≤1024` block at line 3263 — the
narrower breakpoint loses, which is the opposite of what everyone assumes.

Confirmed instances found and fixed this session:

- `.scroll-indicator` — the `≤640` block set `bottom: 90px` / `height: 26px`
  with a carefully documented rationale (avoiding the hero's torn-paper
  `clip-path`). **It had never once taken effect**; `≤1024` overrode all three
  properties. The rationale was also obsolete, since `≤1024` sets
  `clip-path: none`. Block deleted, replaced with a comment explaining why.
- `.story-card` background — declared in the base rule, the `≤968` block, and
  the `≤1024` block. Changing the base did nothing on phones because `≤968`
  still carried the old `var(--ui-paper)`. Now declared **only** in the base rule.
- Chapter 2's gantt chart and chapter 3's chart flattening (earlier in this
  session) had the same root cause.

**Rules of engagement**

1. When a CSS change "has no effect after a hard refresh", assume a later
   media block overrides it *before* you suspect caching.
2. `grep -n "<selector>"` and check **every** hit, including nested ones.
   `grep "^\s*\.selector {"` only matches base-level (8-space) rules and
   will miss the ones inside media blocks. I made exactly this mistake with
   `.story-card` and reported a fix that did nothing.
3. Prefer **one declaration in the base rule** over per-breakpoint copies.
   Media blocks should carry only what genuinely differs (padding, sizes),
   never a colour that is supposed to be shared.

---

## 2. `position: sticky` — percentage insets and the dual-purpose `top`

Chapter 3's chart covered the chapter intro because `top: 50%` was copied
from chapter 2's band, which is `position: fixed`.

```
fixed   →  percentage insets resolve against the VIEWPORT.
           top: 50% = half a viewport. Correct for chapter 2.

sticky  →  percentage insets resolve against the CONTAINING BLOCK.
           Here that is #chapter-3-rebuilt: intro + 5 × 100svh cards +
           footer, i.e. 300svh+. top: 50% became a ~150svh nonsense value.
```

Worse, **sticky's `top` does double duty**: it is both the resting position
*and* the threshold at which the element starts sticking. One bad value
breaks both at once.

Fix: `top: 21dvh` — a viewport unit, computed as `(100dvh − 58dvh) / 2` to
centre the 58dvh band. That also let `translateY(-50%)` be removed, which
matters structurally: without the `-50%` lift the band never paints above its
own flow position, so overlapping the element above it became **impossible by
construction** rather than being prevented by a clearance hack.

**Rule of engagement:** never use `%` for insets on a sticky element in this
file. Use `dvh`/`svh`. If you need centring, compute the inset rather than
combining `top: 50%` with a `-50%` transform.

---

## 3. Never measure an element that your own transform moves

`updateChapter3Bars()` computed the chart's exit offset from
`ch3Container.getBoundingClientRect().top` — but that panel lives inside
`#ch3-sticky-box-wrapper`, which is translated by the very offset being
computed. `getBoundingClientRect()` includes ancestor transforms, so:

```
offset_n = (rest position − offset_{n−1}) − cardTop
         = B − offset_{n−1}
```

That recurrence **does not converge** — it alternates between `x` and `B − x`.
The `transition: transform 0.1s linear` on `.gantt-sticky-box-rebuilt` acts as
a low-pass filter and damps it to the fixed point `B / 2`.

**Observable symptom:** the chart exits at exactly half the intended speed, so
it is still covering content that should already be clear of it. Screenshot
measurement confirmed the prediction — actual offset ≈ 26dvh where ≈ 52dvh
was correct.

Fix (mobile branch only; desktop deliberately untouched):

```js
const exitAnchor = isMobile
    ? (parseFloat(getComputedStyle(stickyWrapper).top) || 0)  // pure inset, no transform
    : containerTop;
```

`getComputedStyle().top` returns the resolved **inset** (21dvh → px), which is
transform-independent. While the band is stuck, that value equals its real
viewport position.

**Rule of engagement:** if JS publishes a CSS variable that drives a transform,
the value must never be derived from a `getBoundingClientRect()` of that
element or its descendants. Anchor to an untransformed reference —
`getComputedStyle().top`, a sibling, or the section itself.

---

## 4. Measure what the reader sees, not the layout wrapper

`.gantt-card-rebuilt` carries `padding-top: calc(var(--site-header-h) + 82dvh)`
to push its visible text below the pinned band. So the wrapper's `rect.top`
sits **~82dvh above the `.story-card` the reader actually sees**.

The step trigger measured the wrapper, so every chart step fired ~82dvh early:
card 1's text was still mid-screen while the chart had already advanced to
step 2. Arithmetic reproduced the reported screenshot exactly.

Fix: a `measureTop()` helper that returns the `.story-card` rect on mobile and
keeps the wrapper rect on desktop, with the threshold re-derived as `88dvh`
(band bottom 79dvh + 9dvh of breathing room). The same helper now feeds card
5's exit offset, which previously began pushing the chart away while card 5's
text was still below the fold.

---

## 5. Smaller things worth knowing

**`paper-texture.png` + `background-blend-mode: multiply` darkens by ~4%.**
Measured mean of the texture is `#f4f4f4` (244.4/255). To make a textured
surface match a flat one, divide: `fill = 255 × target ÷ 244.4`. Worked
example: `.timeline-block-node` is flat, `.story-card` is textured, so
matching the node's `#ebe5d2` required filling `.story-card` with `#f5efdb`.
Filling both with the same hex leaves the textured one visibly darker.

**Geometry constants are coupled — recompute, don't eyeball.** The hero stamp
enlargement (84px×scale(0.9) → 104px, scale removed) forced `top`, the arrow
size, and `.hero-title`'s `margin-top` to be re-derived together. The
derivation is written into the comment at `.hero-title`; any change to stamp
size, `top`, or arrow height must redo it.

**Two elements moving at the same rate can be checked at a single instant.**
For the chapter-3 conclusion footer, both the chart and the footer scroll
upward 1:1 once the exit begins, so their separation is constant and the
scroll variable cancels. That reduced "how much `padding-top` does the footer
need" to one inequality evaluated at the exit's starting instant:
`39dvh + padding-top > 79dvh` → `padding-top > 40dvh`. Set to 56dvh.

**Symbol glyphs ignore `font-weight`.** `↑` (U+2191) has no bold face in most
fonts and browsers may not synthesise one. Use
`-webkit-text-stroke: <n>px currentColor` to thicken reliably; `currentColor`
keeps it in sync with hover states.

**Prefer `filter: drop-shadow()` over `box-shadow` for alpha-faded elements.**
`box-shadow` follows the border-box rectangle regardless of background alpha,
so a gradient that fades to transparent still casts a full-height rectangle.
`drop-shadow` follows the rendered alpha. (Identified while planning the
scroll-indicator shadow; **not yet implemented** — see Open items.)

---

## Verification workflow that actually worked

Browser automation was unavailable all session (the Chrome extension never
connected), so **nothing here was verified in a real browser by me** — every
fix was confirmed by the user on a real device, or by arithmetic against a
screenshot. What proved reliable:

1. **Reproduce the reported symptom numerically before editing.** Measuring the
   screenshot and predicting the same numbers from the code is what separated
   "the chart exits at half speed" (a real feedback bug) from "the padding is
   too small" (the wrong fix I had already shipped once).
2. Cheap static checks after every edit — worth keeping:
   ```bash
   # JS syntax across every <script> block
   python3 - <<'EOF'
   import re,subprocess,tempfile,os
   src=open('index-v2.html',encoding='utf-8').read()
   for b in re.findall(r'<script(?![^>]*ld\+json)[^>]*>(.*?)</script>',src,re.S):
       if not b.strip(): continue
       with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8') as f:
           f.write(b); p=f.name
       r=subprocess.run(['node','--check',p],capture_output=True,text=True)
       print('FAIL' if r.returncode else 'ok', r.stderr[:200]); os.unlink(p)
   EOF
   # CSS brace balance — currently 417/417
   ```
3. **Beware `grep` pattern artifacts.** A pattern starting with `-` (e.g.
   `-webkit-text-stroke`) is parsed as an option and silently returns 0,
   which reads exactly like "my change vanished". Use `grep -- "-pattern"`
   or drop the leading dash.

---

## Open items

- **Nothing in this session was verified by me in a browser.** The user tested
  on-device between rounds, but the last few rounds (hero stamp enlargement,
  terminus mark, conclusion-footer padding, and the chapter-3 exit-anchor fix)
  have **not** been confirmed on a real phone yet. The exit-anchor fix is the
  highest-value one to check: chapter 3's chart should now fully clear the
  screen before the conclusion text arrives.
- **`.scroll-indicator` colour + shadow is planned but NOT implemented.**
  Agreed with the user: both breakpoints' `::after` line becomes
  `var(--ui-ink-inverse)` (desktop text stays seal red), and both the line
  (`filter: drop-shadow`) and the text (`text-shadow`) get a shadow. Both
  edits belong in the **base** rules only — the `≤1024` block declares neither
  `background` nor `text-shadow`, so it will not override.
- **Dead code found but left alone** (out of scope, safe to clean later):
  `.hero-section`'s background declarations in the `≤640` block near line 228
  are fully overridden by the `≤1024` block at line 3275; and
  `grid-template-rows` on `.hero-section` near line 3555 is inert because
  nothing ever sets `display: grid` on that element.
- **Duplicate declarations remain** in the `≤968` and `≤1024` `.story-card`
  rules (`background-image`, `background-repeat`, `background-blend-mode`,
  `backdrop-filter`, `max-width` are byte-identical in both). Only the colour
  was de-duplicated, at the user's instruction to change that one property.
