---
type: UserStory
id: US-1.7
title: "Badge-Based Candidate View"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.7.1
---

# US-1.7: Badge-Based Candidate View

**As a** landlord
**I want to** compare candidates through privacy-preserving badges and scores instead of raw personal data
**So that** I can make an informed decision while respecting candidate privacy and data protection regulations

## Acceptance Criteria

- **AC-1.7.1:** The system shall display each candidate's verification results as badges (identity verified, income verified, credit verified) with a green/amber/red/grey status indicator.
- **AC-1.7.2:** The system shall display the composite qualification score as a percentile (0-100) alongside a breakdown per active criterion.
- **AC-1.7.3:** The system shall display the candidate's personal statement and preferred move-in date.
- **AC-1.7.4:** The system shall never display raw income amounts, credit scores, or identity document details to the landlord or listing tenant.
- **AC-1.7.5:** The system shall support sorting and filtering the candidate list by overall score, individual badge status, or submission date.
- **AC-1.7.6:** The system shall show the candidate count and average score on the listing summary view.
- **AC-1.7.7:** The system shall make the badge display accessible (WCAG 2.1 AA) by including text labels alongside color indicators.