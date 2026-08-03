## ADDED Requirements

### Requirement: Load budget and theme data from local static files

`database.html` SHALL fetch `data/budget.json` and `data/themes.json` from the same origin on page load. `database.html` SHALL NOT issue any request to `docs.google.com` or any other live spreadsheet endpoint during normal page load. The `115MoneyDemoB-main/database.html` mirror SHALL apply the same fetch behavior for consistency with the root copy.

#### Scenario: Page load fetches only local static data

- **WHEN** `database.html` is opened in a browser with `data/budget.json` and `data/themes.json` present at the same origin
- **THEN** the page renders the budget table and no network request to `docs.google.com` is made, verifiable via the browser's network panel

#### Scenario: Static data load failure shows a user-friendly error

- **WHEN** `data/budget.json` or `data/themes.json` cannot be fetched (e.g. missing file, non-200 response)
- **THEN** the results area displays a user-visible error message in Chinese instead of an unhandled JavaScript exception

### Requirement: Concurrent data fetching on page load

`database.html`'s `initPage()` SHALL issue the `data/budget.json` and `data/themes.json` fetches concurrently rather than sequentially. Neither fetch SHALL be awaited to completion before the other is initiated.

#### Scenario: Both fetches are initiated without waiting on each other

- **WHEN** `database.html`'s `initPage()` begins loading data
- **THEN** the requests for `data/budget.json` and `data/themes.json` are both in flight before either has completed, verifiable by observing that neither `fetch()` call is preceded by an `await` of the other's completed response
