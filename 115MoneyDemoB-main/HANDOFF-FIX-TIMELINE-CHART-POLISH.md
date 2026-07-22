# HANDOFF: fix-timeline-chart-polish

> **Spectra change**: `fix-timeline-chart-polish`
> **File to modify**: `115MoneyDemoB-main/index.html` (4117 lines, single-file monolith: HTML + CSS + JS)
> **Reference file**: `115MoneyDemoB-main/index-v2.html` (contains working implementations to port)
> **Tasks**: 10 tasks across 9 groups (all `- [ ]` unchecked)
> **Command to start**: `/spectra-apply fix-timeline-chart-polish`

---

## Project Overview

This is a scrollytelling editorial page for Taiwan's 115年度 government budget review (中央通訊社). The page has 4 chapters:
- **Chapter 1**: Timeline of budget review events (center-aligned vertical timeline with cards and date nodes)
- **Chapter 2**: Historical context (Gantt chart + story cards with scroll-driven reveal)
- **Chapter 3**: Budget breakdown (stacked bar chart)
- **Chapter 4**: 718億先行動支方案 (pyramid comparison chart + ranking tables)

The page uses **no framework** — it's vanilla HTML/CSS/JS in a single file. CSS variables define the design system (`:root` block at top). Scroll interactions use `IntersectionObserver` and `requestAnimationFrame` scroll listeners.

---

## Architecture Quick Reference

| Concept | Location in `index.html` |
|---------|-------------------------|
| CSS variables (`:root`) | Lines 12–100 |
| `.scroll-indicator` CSS | Lines 303–324 |
| `.story-card` base CSS | Lines 414–454 |
| `.center-timeline-container` CSS | Lines 487–496 |
| `.center-main-line` / `.center-main-line-fill` CSS | Lines 499–522 |
| Timeline row layout CSS | Lines 524–644 |
| **Forced static override** (the bug) | Lines 635–639 |
| Mobile timeline CSS (`@media max-width: 968px`) | Lines 649–688 |
| Chapter 2 rebuilt styles | Lines 693–1350 |
| Pyramid chart CSS | Lines 1691–1973 |
| Footer CTA CSS | Lines 1976–1987 |
| CTA button CSS | Lines 1988–2015 |
| Mobile Chapter 1 timeline line (`::before`) | Lines 2050–2061 |
| Mobile node item border (`var(--primary)`) | Lines 2074–2085 |
| Hero section HTML | Lines 2700–2772 |
| `.scroll-indicator` HTML | Line 2771 |
| Chapter 1 timeline HTML start | Line 2822 |
| `.center-main-line` HTML | Lines 2823–2825 |
| Timeline rows (nodes + cards) | Lines 2827–3160 |
| Chapter 2 rebuilt HTML | Lines 3162–3230 |
| Pyramid chart HTML | Lines 3319–3419 |
| Footer HTML | Lines 3721–3723 |
| IntersectionObserver (scenes) | Lines 3728–3808 |
| `updateChapter2Stage()` | Lines 3812–3919 |
| `updateChapter3Bars()` | Lines 3921–4016 |
| `updateTimelineMainLineFill()` | Lines 4020–4029 |
| rAF scroll listener | Lines 4031–4046 |

---

## Key CSS Variables

```css
--primary: #A5271E;           /* Dark Seal Red — LOW CONTRAST on dark bg */
--np-seal-red: #A5271E;       /* Same as --primary */
--np-seal-red-bright: #E2564A; /* High-contrast bright red for dark backgrounds */
--bg-deep: #12191A;           /* Page background */
--bg-chart: #1E2624;          /* Chart panel background */
--ui-accent: #A5271E;         /* Used for timeline terminus mark */
--ui-paper: #EDE6D3;          /* Light paper color */
--np-paper-panel: #f9f1e2;    /* Story card background */
```

---

## Task-by-Task Implementation Guide

### Task 1.1: Timeline Card/Node Reveal CSS

**What exists now (THE BUG)** — Lines 634–639:
```css
/* 強制重置故事卡片在置中佈局時的互動指針效果 */
.timeline-row.item-card .story-card {
    pointer-events: auto !important;
    opacity: 1 !important;
    transform: none !important;
}
```

**What to replace it with** (from `index-v2.html` lines 712–734):
```css
/* Progressive scroll-driven reveal for timeline cards */
.js .center-timeline-container .timeline-row.item-card .story-card {
    opacity: 0 !important;
    pointer-events: none !important;
    transform: translateY(18px) rotate(-0.4deg) !important;
    transition: opacity 320ms ease, transform 420ms cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.js .center-timeline-container .timeline-row.item-card.timeline-card-revealed .story-card {
    opacity: 1 !important;
    pointer-events: auto !important;
    transform: translateY(0) rotate(-0.4deg) !important;
}

/* Progressive scroll-driven reveal for timeline date nodes */
.js .center-timeline-container .timeline-row.item-node .timeline-block-node {
    opacity: 0 !important;
    transform: translateY(18px) !important;
    transition: opacity 320ms ease, transform 420ms cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.js .center-timeline-container .timeline-row.item-node.timeline-node-revealed .timeline-block-node {
    opacity: 1 !important;
    transform: translateY(0) !important;
}
```

**Also add** (if not already present) a small inline script near the top of `<body>` or at the start of the first `<script>` block:
```html
<script>document.documentElement.classList.add('js');</script>
```
This ensures the reveal CSS only activates when JS is available (graceful degradation).

**Keep** the `.timeline-row.item-card:hover .story-card` rule (lines 641–644) unchanged.

---

### Task 2.1: Extend `updateTimelineMainLineFill()` JS

**Current function** — Lines 4020–4029:
```javascript
function updateTimelineMainLineFill() {
    const container = document.getElementById('center-timeline-container');
    const fill = document.getElementById('center-main-line-fill');
    if (!container || !fill) return;
    const rect = container.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.5;
    const scrolled = window.innerHeight * 0.5 - rect.top;
    const percent = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
    fill.style.height = percent + '%';
}
```

**Replace with** (ported from `index-v2.html` lines 4944–4990):
```javascript
function updateTimelineMainLineFill() {
    const container = document.getElementById('center-timeline-container');
    const fill = document.getElementById('center-main-line-fill');
    if (!container || !fill) return;
    const rect = container.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.5;
    const scrolled = window.innerHeight * 0.5 - rect.top;
    const percent = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
    fill.style.height = percent + '%';

    // Task 3.2: Toggle terminus mark completion state
    const terminusMark = document.getElementById('timeline-terminus-mark');
    if (terminusMark) {
        terminusMark.classList.toggle('timeline-complete', percent >= 100);
    }

    // Task 2.1: Scroll-driven card/node reveal
    const timelineOnScreen = rect.bottom > 0 && rect.top < window.innerHeight;
    if (timelineOnScreen) {
        const fillTipViewportY = rect.top + (percent / 100) * rect.height;
        container.querySelectorAll('.timeline-row.item-card, .timeline-row.item-node').forEach(row => {
            const rowRect = row.getBoundingClientRect();
            const revealedClass = row.classList.contains('item-card') ? 'timeline-card-revealed' : 'timeline-node-revealed';
            row.classList.toggle(revealedClass, fillTipViewportY >= rowRect.top + 40);
        });
    }
}
```

**Note**: Tasks 2.1 and 3.2 are combined into this single function update.

---

### Task 3.1: Terminus Mark HTML + CSS

**HTML** — Insert after line 2825 (after `</div>` closing `.center-main-line`):
```html
            <div class="timeline-terminus-mark" id="timeline-terminus-mark" aria-hidden="true"></div>
```

The placement must be INSIDE `.center-timeline-container` but OUTSIDE `.center-main-line` (as a sibling, not child), because `.center-main-line` has `overflow: hidden` which would clip it.

**CSS** — Add near the `.center-main-line-fill` rules (after line 522):
```css
/* Timeline terminus mark: pulsing "?" while incomplete, "↓" when complete */
.timeline-terminus-mark {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 50%);
    z-index: 2;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--ui-accent);
    color: var(--ui-paper);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    line-height: 1;
    box-shadow: 0 2px 6px rgba(27, 23, 18, 0.25);
    animation: timeline-terminus-pulse 1.8s ease-in-out infinite;
}

.timeline-terminus-mark::before {
    content: '?';
}

.timeline-terminus-mark.timeline-complete {
    animation: none;
    transform: translate(-50%, 50%) scale(1);
}

.timeline-terminus-mark.timeline-complete::before {
    content: '\2193';
}

@keyframes timeline-terminus-pulse {
    0%, 100% {
        opacity: 0.55;
        transform: translate(-50%, 50%) scale(0.92);
    }
    50% {
        opacity: 1;
        transform: translate(-50%, 50%) scale(1.08);
    }
}
```

**JS** — Already covered in Task 2.1's function update above.

---

### Task 4.1: Chapter 2 Story Card Readability

**Context**: The user sees story cards in the Chapter 1 timeline (not Chapter 2 gantt cards) fading too early. The user's screenshots show `opacity: 0.476752` on a card that should still be readable.

**Note**: After implementing Task 2.1 (scroll-driven reveal), the Chapter 1 timeline cards will use a binary revealed/hidden toggle based on the red line position, NOT a continuous opacity calculation. This means the "fade too early" issue for **Chapter 1 timeline cards** is resolved by Tasks 1.1 + 2.1.

If the "story cards fade too early" refers to **Chapter 2** story cards (gantt-card-rebuilt), look at the `updateChapter2Stage()` function (lines 3812–3919). The scroll-percent thresholds control which step is active. The IntersectionObserver (lines 3728–3808) handles `.is-active` toggling. Check if the rootMargin thresholds (line 3806: `rootMargin: '-10% 0px -20% 0px'`) cause cards to lose `.is-active` too early and adjust if needed.

**The implementer should**: Check the scroll handler logic and ensure cards remain visible (opacity >= 0.85) when at or below 50% viewport height. If the Chapter 2 gantt cards fade via CSS transitions triggered by scroll-percent thresholds, adjust those thresholds.

---

### Task 5.1: Pyramid Chart Entrance Animation

**The problem**: Line 3319–3320 has inline styles that override CSS animations:
```html
<div class="dynamic-chart-box"
    style="position: relative; opacity: 1; visibility: visible !important; transform: none !important; height: auto; width: 100%; padding: 0; pointer-events: auto;">
```

**Fix**:
1. Remove inline `opacity: 1; visibility: visible !important; transform: none !important;` from the `.dynamic-chart-box` div (line 3319-3320). Keep `position: relative; height: auto; width: 100%; padding: 0; pointer-events: auto;`.

2. Ensure `.bar-rect` starts at `width: 0` by default. Currently line 3351 already shows `style="width: 0%;"` for some bars, but line 3356 shows `style="width: 100%;"`. The bars should start at 0% and only expand when `.visible-box` is added. **Move the target widths into data attributes** and set inline width to 0%:
   ```html
   <div class="bar-rect rect-primary" style="width: 0%;" data-target-width="100%">
   ```
   Then in the IntersectionObserver (around line 3784), when `.visible-box` is added, also set each `.bar-rect`'s width to its data-target-width.

3. Add staggered transition-delays in CSS:
   ```css
   .pyramid-align-row:nth-child(1) .bar-rect { transition-delay: 0ms; }
   .pyramid-align-row:nth-child(2) .bar-rect { transition-delay: 50ms; }
   .pyramid-align-row:nth-child(3) .bar-rect { transition-delay: 100ms; }
   .pyramid-align-row:nth-child(4) .bar-rect { transition-delay: 150ms; }
   .pyramid-align-row:nth-child(5) .bar-rect { transition-delay: 200ms; }
   ```
   Note: The `.pyramid-align-row` elements start at child position 3 within their parent (after `.pyramid-grid-bg-layer` and `.pyramid-title-row`), so use `nth-child(3)` through `nth-child(7)` or scope more precisely.

---

### Task 6.1: Primary Red Contrast

**Two specific changes**:

1. **Mobile timeline line gradient** — Line 2058:
   ```css
   /* BEFORE */
   background: linear-gradient(to bottom, var(--primary) 0%, var(--accent) 70%, var(--danger) 100%);
   /* AFTER */
   background: linear-gradient(to bottom, var(--np-seal-red-bright) 0%, var(--accent) 70%, var(--danger) 100%);
   ```

2. **Mobile node border** — Line 2077:
   ```css
   /* BEFORE */
   border: 2px solid var(--primary);
   /* AFTER */
   border: 2px solid var(--np-seal-red-bright);
   ```

**Do NOT change** the CTA button (`.cta-btn`, line 1994) — white text on `--primary` background passes contrast.

---

### Task 7.1: Footer Visual Distinction

**Current footer** — Line 3721:
```html
<footer style="background: radial-gradient(circle, rgba(237, 230, 211, 0.05) 1px, transparent 1.2px) 0 0/4px 4px, var(--bg-deep); color: var(--np-muted-ondark); text-align: center; padding: 24px 20px; font-size: 0.85rem;">
```

**Change to**:
```html
<footer style="background: radial-gradient(circle, rgba(237, 230, 211, 0.05) 1px, transparent 1.2px) 0 0/4px 4px, #1E1410; border-top: 1px solid rgba(237, 230, 211, 0.12); color: var(--np-muted-ondark); text-align: center; padding: 24px 20px; font-size: 0.85rem;">
```

Key changes: `var(--bg-deep)` → `#1E1410` (warm dark charcoal) + added `border-top`.

---

### Task 8.1: Mobile Scroll Indicator

**Add** inside an existing `@media (max-width: 640px)` block or create a new one (near line 340 where mobile adjustments live):

```css
@media (max-width: 640px) {
    .scroll-indicator {
        bottom: 90px;
        animation: bounce-mobile 2s infinite;
    }
    .scroll-indicator::after {
        height: 26px;
    }
}

@keyframes bounce-mobile {
    0%, 20%, 50%, 80%, 100% { transform: translate(-50%, 0); }
    40% { transform: translate(-50%, -6px); }
    60% { transform: translate(-50%, -3px); }
}
```

**Why**: The hero section has a torn-paper `clip-path` at the bottom. At `bottom: 40px` (desktop default), the scroll indicator gets clipped on mobile. Moving to `bottom: 90px` and using a smaller bounce amplitude (`-6px` vs `-10px`) keeps it visible.

---

### Task 9.1: Mobile Red Line Animation

**Check** if there's any `@media (max-width: 640px)` rule that forces `.center-main-line-fill { height: 100% !important; }`. In the current `index.html`, this does NOT exist (it's only in `index-v2.html`). So the JS `updateTimelineMainLineFill()` should already work on mobile — **just confirm** that no such override exists and mark the task done.

---

## Critical Pitfalls

1. **Line numbers drift** as you make edits. Always search by CSS selector or function name, not line number.
2. **The file is huge** (186KB). Use targeted search/replace, don't try to rewrite large sections.
3. **`!important` wars**: The existing CSS uses `!important` extensively. The new reveal CSS must also use `!important` to win specificity.
4. **`.js` class gating**: The reveal CSS uses `.js .center-timeline-container` prefix. Without the `document.documentElement.classList.add('js')` script, all cards will be permanently hidden.
5. **`.center-main-line` has `overflow: hidden`**: The terminus mark MUST be placed as a sibling (not child) of `.center-main-line` inside `.center-timeline-container`.
6. **Pyramid chart bars**: Some bars already have `style="width: 0%;"` and others have their final width inline. The animation approach needs to handle both cases.

## Spectra Commands

```bash
# Mark a task done after implementing it:
spectra task done --change "fix-timeline-chart-polish" <task-id>
# Example: spectra task done --change "fix-timeline-chart-polish" 1.1

# Check current progress:
spectra instructions apply --change "fix-timeline-chart-polish" --json

# When all tasks done:
# Suggest user runs: /spectra-archive fix-timeline-chart-polish
```

## Non-Goals (DO NOT implement)

- Chapter 2→Chapter 3 exit fade synchronization
- Changing timeline layout or card positioning
- Modifying any file other than `115MoneyDemoB-main/index.html`
- Changing `.cta-btn` background color
