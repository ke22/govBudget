## ADDED Requirements

### Requirement: Chinese body text enforces punctuation line-break rules

The hero dek paragraph and every `.story-card p` SHALL apply `line-break: strict` while keeping `text-align: justify`, so that Chinese punctuation 禁則 is enforced: an opening bracket SHALL NOT be left at the end of a line, and a closing bracket, 、, 。, or other closing punctuation SHALL NOT begin a line.

#### Scenario: Closing punctuation never starts a line

- **WHEN** a Chinese paragraph such as "…歷年各政黨執政時的預算審議時程（從9月至隔年5月）。" wraps across lines at phone width
- **THEN** no wrapped line begins with 」, ）, 、, 。, ！, or ？, and no wrapped line ends with （ or 「

#### Scenario: Alignment preserved

- **WHEN** the affected paragraphs are rendered
- **THEN** they remain justified (`text-align: justify`) and `word-break: auto-phrase` is not applied
