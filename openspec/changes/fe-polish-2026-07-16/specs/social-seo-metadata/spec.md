## ADDED Requirements

### Requirement: Pages declare description and Open Graph metadata

Both `index.html` and `database.html` SHALL include a `<meta name="description">` tag and the full Open Graph tag set (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) in their `<head>`, with `og:image` and `og:url` as absolute URLs.

#### Scenario: Sharing the report link to a social platform

- **WHEN** the `index.html` URL is pasted into a platform that reads Open Graph tags
- **THEN** the resulting preview SHALL show the page's own title, description, and image rather than falling back to arbitrary page content

#### Scenario: Absolute image and URL fields

- **WHEN** the `og:image` and `og:url` tags are read from either page
- **THEN** their values SHALL be fully-qualified absolute URLs, not relative paths

### Requirement: Pages declare Twitter Card metadata

Both pages SHALL include `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` meta tags.

#### Scenario: Sharing the link on X/Twitter

- **WHEN** the `database.html` URL is shared on a platform reading Twitter Card tags
- **THEN** the resulting preview SHALL use the declared `twitter:*` fields

### Requirement: Pages declare a canonical URL

Both pages SHALL include a `<link rel="canonical">` tag pointing to their own absolute, final published URL.

#### Scenario: Search engine indexing

- **WHEN** a search engine crawls either page
- **THEN** it SHALL find a canonical link pointing to that page's own published URL

### Requirement: Pages declare structured data

Both pages SHALL include a `<script type="application/ld+json">` block describing the page as structured content (`NewsArticle` for `index.html`, `Dataset` or `WebPage` for `database.html`), with fields populated from the page's actual title, description, and publisher information.

#### Scenario: Rich-result eligibility

- **WHEN** a search engine or AI answer-engine crawler parses either page
- **THEN** it SHALL find a valid JSON-LD block whose `@type`, `headline`/`name`, and `description` fields match the page's actual visible content
