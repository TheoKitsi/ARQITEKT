---
type: UserStory
id: US-1.3
title: "Criteria-Based Matching"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.3.1
---

# US-1.3: Criteria-Based Matching

**As a** property owner
**I want to** receive candidates matched against my specific search criteria
**So that** I only see candidates who genuinely fit my requirements

## Acceptance Criteria

- **AC-1.3.1:** The system shall evaluate each pool candidate against the search criteria: location proximity (geocoded distance), budget fit (rent within candidate's range), badge requirements (all required badges verified), move-in timeline compatibility, and unit size preference.
- **AC-1.3.2:** The system shall compute a matching score (0-100) using configurable weights per criterion.
- **AC-1.3.3:** The system shall apply hard filters first (location, budget, required badges) to eliminate non-viable candidates before scoring.
- **AC-1.3.4:** The system shall rank candidates by matching score descending.
- **AC-1.3.5:** The system shall complete the initial matching run within 30 minutes of search creation.
- **AC-1.3.6:** The system shall exclude candidates who are already on a shortlist for another search by the same owner (prevent double-matching).