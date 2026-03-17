---
type: UserStory
id: US-1.4
title: "Qualification-Based Ranking"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.4.1
---

# US-1.4: Qualification-Based Ranking

**As a** listing tenant
**I want to** see candidates ranked by their qualification score based on the criteria catalog
**So that** I can present the most suitable candidates to the landlord

## Acceptance Criteria

- **AC-1.4.1:** The system shall compute a qualification score for each candidate by evaluating their verification data and candidacy inputs against the listing's criteria catalog with normalized weights.
- **AC-1.4.2:** The system shall update the ranking in real time as new candidacies arrive or existing candidates withdraw.
- **AC-1.4.3:** The system shall break ties by candidacy submission timestamp (earlier submission ranks higher).
- **AC-1.4.4:** The system shall display the ranking to the listing tenant with score breakdown per criterion, but without revealing raw personal data.
- **AC-1.4.5:** The system shall not display the ranking to candidates — candidates only see their own application status.
- **AC-1.4.6:** The system shall flag candidates whose score drops below a configurable minimum threshold and mark them as "below threshold" without removing them.
- **AC-1.4.7:** The system shall log every score calculation with input values and weights for audit purposes.