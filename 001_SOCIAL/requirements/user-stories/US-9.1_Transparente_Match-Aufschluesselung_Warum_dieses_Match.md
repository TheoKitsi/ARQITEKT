---
type: user-story
id: US-9.1
status: draft
parent: SOL-9
version: "1.0"
---

# US-9.1: Transparent Match Breakdown "Why This Match?"

> **As a** user **I want to** see a transparent breakdown for each match proposal explaining why exactly this person was suggested **so that** I can make informed decisions and can understand the quality of the suggestions.

## Acceptance Criteria

- [ ] AC-9.1.1: Each match proposal shows a category-wise compatibility breakdown (e.g. Values 98%, Lifestyle 87%, Future 91%).
- [ ] AC-9.1.2: Fulfilled and unfulfilled deal-breakers are visually highlighted (check = passed / warning = borderline).
- [ ] AC-9.1.3: The top 3 commonalities and top 3 differences are summarized in text.
- [ ] AC-9.1.4: The overall score is accompanied by a qualitative assessment (e.g. "Very high compatibility", "Good basis with differences in details").
- [ ] AC-9.1.5: The breakdown only shows information released according to visibility level 2.
- [ ] AC-9.1.6: Categories containing exclusively level-1 fields (e.g. income, sexual preferences, kinks) are NOT displayed as separate categories in the breakdown — no percentage match shown. Level-1 fields only contribute to the overall score without their category becoming visible. (-> SOL-16)

## Components

- CMP-9.1.1: Match Transparency Module