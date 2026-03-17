---
type: UserStory
id: US-1.5
title: "Landlord Decision and Runner-Up"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.5.1
---

# US-1.5: Landlord Decision and Runner-Up

**As a** landlord
**I want to** review the top candidates and accept or reject them with automatic runner-up promotion
**So that** I maintain full control over the successor selection while ensuring the process continues smoothly if my first choice falls through

## Acceptance Criteria

- **AC-1.5.1:** The system shall present the landlord with a shortlist of the top N candidates (configurable, default 3) including their badges, score breakdown, and personal statement.
- **AC-1.5.2:** The system shall allow the landlord to accept exactly one candidate or reject individual candidates with a mandatory reason selection (predefined categories + optional free text).
- **AC-1.5.3:** The system shall, upon rejection of the accepted candidate or candidate withdrawal, automatically promote the next highest-ranked candidate and notify all affected parties.
- **AC-1.5.4:** The system shall enforce a decision deadline (configurable, default 7 days) after which the listing tenant is notified and may escalate or extend.
- **AC-1.5.5:** The system shall record all accept/reject decisions with timestamp, reason, and landlord identity for the audit trail.
- **AC-1.5.6:** The system shall notify the accepted candidate immediately and all rejected candidates within 24 hours.
- **AC-1.5.7:** The system shall prevent the landlord from accepting a candidate whose verification has expired since the candidacy snapshot.