---
type: UserStory
id: US-1.4
title: "Shortlist Delivery"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.4.1
---

# US-1.4: Shortlist Delivery

**As a** property owner
**I want to** receive a ranked shortlist of qualified candidates within 24 hours
**So that** I can quickly begin the tenant selection process

## Acceptance Criteria

- **AC-1.4.1:** The system shall assemble a shortlist of the top N candidates (configurable, default 10) from the matching results.
- **AC-1.4.2:** The system shall display each candidate with: matching score, badge summary (privacy-preserving), preferred move-in date, and budget range — but not personal identity until mutual match.
- **AC-1.4.3:** The system shall deliver the shortlist to the owner via in-app dashboard and email notification within 24 hours.
- **AC-1.4.4:** The system shall allow the owner to approve or dismiss individual candidates on the shortlist.
- **AC-1.4.5:** The system shall notify approved candidates that a landlord is interested and ask for their confirmation (mutual match).
- **AC-1.4.6:** The system shall reveal contact details only after both parties confirm interest (mutual match).
- **AC-1.4.7:** The system shall trigger a new matching round if the owner dismisses most candidates and requests more.