---
type: user-story
id: US-3.1
status: draft
parent: SOL-3
version: "1.0"
---

# US-3.1: Transparent Compatibility Calculation

> **As a** verified user **I want to** receive transparent match proposals with percentage-based compatibility based on my self-description and target person description **so that** I can make informed decisions about whether to pursue contact.

## Acceptance Criteria

- [ ] AC-3.1.1: Matching is bidirectional — A->B AND B->A must both reach the minimum score.
- [ ] AC-3.1.2: Levels 1-3 are weighted more heavily than levels 4-5.
- [ ] AC-3.1.3: Must-Have fields are weighted more heavily than Nice-to-Have fields.
- [ ] AC-3.1.4: A deal-breaker in either profile leads to immediate exclusion — no match.
- [ ] AC-3.1.5: Free-text fields are semantically analyzed via NLP and included in the score.
- [ ] AC-3.1.6: Each match receives an overall score in percent.
- [ ] AC-3.1.7: The minimum score for proposals is configurable (system default + user option).
- [ ] AC-3.1.8: Matches are displayed sorted by score descending.
- [ ] AC-3.1.9: A detail view with strengths/weaknesses overview is available per match.

## Components

- CMP-3.1.1: Matching Engine
- CMP-3.1.2: Match Result Display