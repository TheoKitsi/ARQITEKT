---
type: UserStory
id: US-1.6
title: "Badge and Score Calculation"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.6.1
---

# US-1.6: Badge and Score Calculation

**As a** decision maker
**I want to** view verified attributes as a combinable composite score
**So that** I can compare candidates quickly and fairly

## Acceptance Criteria

- **AC-1.6.1:** The system shall compute a composite score from individual badge scores using configurable weights per check module.
- **AC-1.6.2:** The system shall ensure every score version is historically reproducible by storing the calculation inputs, weights, and algorithm version.
- **AC-1.6.3:** The system shall support hard exclusion rules: critical negative attributes (e.g., failed identity, negative credit) can disqualify a subject regardless of other scores.
- **AC-1.6.4:** The system shall expose the score as a percentile (0-100) with a transparent breakdown showing each component's contribution.
- **AC-1.6.5:** The system shall version the scoring algorithm and maintain backward compatibility — existing scores remain valid under the algorithm version that produced them.
- **AC-1.6.6:** The system shall recalculate scores when underlying badges are updated (e.g., after re-check).