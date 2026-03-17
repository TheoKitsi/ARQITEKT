---
type: UserStory
id: US-1.6
title: "Lease Decision Tracking"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.6.1
---

# US-1.6: Lease Decision Tracking

**As a** property owner
**I want to** record my lease decision and complete the tenant search
**So that** the search is formally closed and all parties are informed

## Acceptance Criteria

- **AC-1.6.1:** The system shall allow the owner to select a candidate from the shortlist as the chosen tenant.
- **AC-1.6.2:** The system shall notify the chosen candidate of the selection with next-step guidance (lease signing coordination).
- **AC-1.6.3:** The system shall notify non-selected candidates that the search has been filled.
- **AC-1.6.4:** The system shall transition the search to "completed" state and record the decision with timestamp and chosen candidate reference.
- **AC-1.6.5:** The system shall allow the owner to close the search without selecting a candidate (no suitable match), transitioning to "closed-unfilled".
- **AC-1.6.6:** The system shall record the outcome for platform analytics (conversion tracking).
- **AC-1.6.7:** The system shall retain search and decision data for 3 years for audit purposes.