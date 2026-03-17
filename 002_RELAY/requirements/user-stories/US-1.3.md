---
type: UserStory
id: US-1.3
title: "Verified Candidacy"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.3.1
---

# US-1.3: Verified Candidacy

**As a** candidate
**I want to** apply for a listing only after my identity, income, and credit have been verified
**So that** I know my application is taken seriously and the landlord can trust my profile

## Acceptance Criteria

- **AC-1.3.1:** The system shall check the candidate's verification status via TrustGate before accepting a candidacy submission.
- **AC-1.3.2:** The system shall reject candidacy if any required verification (identity, income, credit) is missing or expired, and display which verifications are outstanding.
- **AC-1.3.3:** The system shall allow candidates to submit a personal statement (max 2000 characters) and an optional move-in date with their candidacy.
- **AC-1.3.4:** The system shall confirm candidacy receipt to the candidate via email and in-app notification within 60 seconds.
- **AC-1.3.5:** The system shall prevent duplicate candidacies from the same user for the same listing.
- **AC-1.3.6:** The system shall allow a candidate to withdraw their candidacy at any time before the landlord's decision is finalized.
- **AC-1.3.7:** The system shall record the verification snapshot (badge states at time of application) immutably with the candidacy record.