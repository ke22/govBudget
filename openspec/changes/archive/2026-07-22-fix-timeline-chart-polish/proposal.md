## Problem

The `index.html` page is missing several interactive motion effects and visual polish that were implemented in `index-v2.html` but never ported back. Additionally, several cross-cutting visual issues remain on both desktop and mobile:

1. **Timeline card/node reveal lost**: Chapter 1 timeline cards and nodes display statically (`opacity: 1 !important; transform: none !important`) instead of being revealed progressively as the red line fill reaches each element. The scroll-driven reveal choreography from `index-v2.html` (`.timeline-card-revealed` / `.timeline-node-revealed` toggling) is entirely absent.

2. **Timeline terminus mark missing**: The `timeline-terminus-mark` element (pulsing "?" that becomes "↓" at 100% progress) is absent from `index.html`. No HTML element, no CSS styles, no JS toggle exists.

3. **Story cards fade too early in Chapter 2 history**: The two specific story cards in the mapping history section become unreadable before reaching the 50% viewport height threshold. Opacity drops below legible levels prematurely.

4. **718億先行動支方案 pyramid chart lacks entrance animation**: The pyramid comparison chart (`.dash-container-box`) and its bar elements (`.bar-rect`) appear instantly with no scroll-triggered entrance animation, despite having a `transition: width 1s ease-out` CSS rule and a `.visible-box` toggle in the IntersectionObserver.

5. **Primary red (`--primary: #A5271E`) poor contrast on dark backgrounds**: Although most dark-background usages have been migrated to `--np-seal-red-bright`, the variable `--primary` itself is still referenced in some places (CTA button background, mobile timeline line gradient, mobile node border) where contrast may be suboptimal.

6. **Footer visually indistinct from main content**: The `<footer>` element uses `var(--bg-deep)` with only a subtle dot texture, making it visually merge with the `.footer-cta` section above.

7. **Mobile scroll indicator not centered**: The `.scroll-indicator` on mobile lacks the `bounce-mobile` keyframe and the adjusted `bottom: 90px` positioning from `index-v2.html`, causing it to be clipped by the hero's torn clip-path edge. The text "向下捲動探索" appears misaligned.

8. **Mobile red line lacks animation**: On small viewports (`max-width: 640px`), `index-v2.html` forces `.center-main-line-fill { height: 100% !important; }`, but `index.html` lacks any mobile-specific red line animation fallback.

## Root Cause

The `index.html` file was developed alongside `index-v2.html`, but several animation and polish features implemented in v2 were never merged into the main `index.html`. Specific root causes per issue:

1. **Timeline reveal**: Lines 635–638 in `index.html` force `opacity: 1 !important; transform: none !important;` on all timeline cards, overriding any potential reveal animation. The `updateTimelineMainLineFill()` function (line 4020) only sets `fill.style.height` without toggling reveal classes on cards/nodes.

2. **Terminus mark**: The HTML element `<div class="timeline-terminus-mark">` was added to `index-v2.html` line 3689 but was never added to `index.html`. All associated CSS (`.timeline-terminus-mark`, `@keyframes timeline-terminus-pulse`) and JS (`terminusMark.classList.toggle`) are missing.

3. **Story card early fade**: The opacity calculation in the Chapter 2 scroll handler uses thresholds that cause cards to become transparent before reaching the readable viewport zone.

4. **Chart animation**: The IntersectionObserver callback at line 3778 toggles `.visible-box` on the pyramid container, but the pyramid's HTML elements carry inline styles `opacity: 1; visibility: visible !important; transform: none !important;` that override the CSS animation.

5. **Red contrast**: `--primary` is defined as `#A5271E` (contrast ratio ~2.4:1 against `--bg-deep`). While most headings were migrated to `--np-seal-red-bright`, the variable itself is still used in CTA background and mobile timeline decorations.

6. **Footer**: Both `.footer-cta` and `<footer>` resolve to nearly identical `--bg-deep` backgrounds, creating no visual boundary.

7. **Mobile scroll indicator**: The `@keyframes bounce-mobile` and mobile-specific `bottom: 90px` override exist only in `index-v2.html`.

8. **Mobile red line**: The mobile-640px override for `.center-main-line-fill` exists only in `index-v2.html`.

## Proposed Solution

Port the missing features from `index-v2.html` into `index.html` and fix the visual polish issues. All changes target a single file (`115MoneyDemoB-main/index.html`):

### Timeline card/node scroll-driven reveal
- Replace the forced `opacity: 1 !important` override on `.timeline-row.item-card .story-card` with progressive reveal CSS (hidden by default, revealed via `.timeline-card-revealed` class)
- Add corresponding `.timeline-row.item-node` reveal CSS (hidden → revealed via `.timeline-node-revealed`)
- Extend `updateTimelineMainLineFill()` to compute `fillTipViewportY` and toggle `.timeline-card-revealed` / `.timeline-node-revealed` when the red line tip passes each element's position + 40px lead

### Timeline terminus mark
- Add `<div class="timeline-terminus-mark" id="timeline-terminus-mark" aria-hidden="true"></div>` inside `.center-timeline-container`, outside `.center-main-line` (after the closing `</div>` of `.center-main-line`)
- Add CSS for `.timeline-terminus-mark` (position absolute, bottom 0, centered, pulsing "?" via `::before`), `.timeline-complete` state (switches to "↓", stops pulse), and `@keyframes timeline-terminus-pulse`
- Add JS in `updateTimelineMainLineFill()` to toggle `.timeline-complete` when percent >= 100

### Story card readability at 50vh
- Adjust the opacity calculation thresholds in the Chapter 2 scroll handler so that story cards remain at full opacity (readable) until they pass above the 50% viewport height mark, then begin fading

### Pyramid chart entrance animation
- Remove inline `opacity: 1; visibility: visible !important; transform: none !important;` from the pyramid chart HTML elements
- Ensure the `.visible-box` CSS class properly triggers a width-grow + fade-in transition on the `.bar-rect` elements when the IntersectionObserver fires

### Primary red contrast
- Change `--primary` value from `#A5271E` to `#E2564A` (the existing `--np-seal-red-bright`) so all remaining `var(--primary)` references automatically gain sufficient contrast. Alternatively, keep `--primary` as-is and replace the specific usages where contrast fails with `--np-seal-red-bright`

### Footer visual distinction
- Change the `<footer>` background to a visibly different tone (e.g., `#1A1A1A` or `#1E1410` warm dark) from `--bg-deep` (`#12191A`), or add a top border/separator to create a clear visual boundary

### Mobile scroll indicator centering
- Add `@keyframes bounce-mobile` with dampened bounce heights (`-6px`/`-3px`)
- Add `@media (max-width: 640px)` override for `.scroll-indicator` with `bottom: 90px` and the mobile bounce animation
- Add `.scroll-indicator::after { height: 26px; }` in the mobile media query

### Mobile red line
- Add `@media (max-width: 640px)` override: `.center-main-line-fill { height: 100% !important; }`

## Non-Goals

- Porting the Chapter 2→Chapter 3 exit fade synchronization (step-9 card fade-out and `chapter3-intro-revealed` logic) — this is a separate cross-chapter choreography concern
- Changing the overall Chapter 1 timeline layout or card positioning
- Modifying any file other than `115MoneyDemoB-main/index.html`

## Success Criteria

1. **Timeline reveal**: Scrolling through Chapter 1, each timeline card and node starts hidden (`opacity: 0; transform: translateY(18px)`) and fades in with a slide-up transition only after the red line fill passes 40px beyond the element's top edge. Scrolling back up re-hides them.
2. **Terminus mark**: A circular "?" icon pulses at the bottom of the timeline. When the reader scrolls through 100% of the timeline, it stops pulsing and shows "↓".
3. **Story card readability**: The two history story cards in Chapter 2 remain fully readable (opacity >= 0.85) when their top edge is at or below the 50% viewport height mark.
4. **Chart animation**: The 718億 pyramid chart bars grow from zero width to their target width with a 1-second ease-out transition when scrolled into view, triggered by the `.visible-box` class.
5. **Red contrast**: All text and decorative elements using `--primary` or `--np-seal-red-bright` on dark backgrounds achieve a contrast ratio >= 4.5:1 against their immediate background.
6. **Footer separation**: The footer is visually distinguishable from the section above it without requiring the user to look for the copyright text.
7. **Mobile scroll indicator**: "向下捲動探索" is horizontally centered in the hero section and fully visible (not clipped by torn edge) throughout its bounce cycle on viewports <= 640px.
8. **Mobile red line**: The Chapter 1 red timeline line animates on scroll on mobile viewports, not stuck at 0% or 100%.

## Impact

- Affected code:
  - Modified: 115MoneyDemoB-main/index.html
  - New: (none)
  - Removed: (none)
