# desktop-pill-row-scroll Specification

## Purpose

`database-v2.html`'s theme/ministry pill rows must be reachable by desktop mouse users via a drag-to-scroll interaction, not just an overflow hint with a hidden scrollbar.

## Requirements

### Requirement: Desktop users can reach hidden pills via drag-to-scroll

Each `.pill-row` in `database-v2.html` (`#theme-pills`, `#ministry-pills`) SHALL support horizontal drag-to-scroll via mouse/pointer input, so a desktop user without a trackpad or horizontal-scroll-capable mouse can reach pills positioned past the visible edge of the row.

#### Scenario: Dragging the pill row scrolls it horizontally

- **WHEN** a user presses the mouse button inside a `.pill-row`, moves the pointer horizontally while holding the button, and releases it
- **THEN** the row's `scrollLeft` changes by an amount matching the horizontal pointer movement, revealing previously hidden pills

#### Scenario: A plain click without movement still selects a pill

- **WHEN** a user presses and releases the mouse button on a `.pill-btn` without moving the pointer more than a small threshold
- **THEN** the pill's existing click/select behavior fires normally, unaffected by the drag-to-scroll handler

#### Scenario: Interrupted drag does not leave stale scroll state

- **WHEN** a `pointerleave` or `pointerup` event fires while a drag is in progress
- **THEN** the row stops tracking the drag immediately, and a subsequent unrelated pointer movement over the row SHALL NOT cause any further scroll change until a new drag begins

#### Scenario: Existing scroll-fade indicators still update during a drag

- **WHEN** a drag-to-scroll changes a `.pill-row`'s `scrollLeft`
- **THEN** the existing `fade-left`/`fade-right` class toggling SHALL continue to reflect whether more content is hidden on either side, the same as with native scroll or touch-swipe
