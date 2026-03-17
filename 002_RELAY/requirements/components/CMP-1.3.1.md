---
type: Component
id: CMP-1.3.1
title: "Candidacy Service"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.3
functions:
  - FN-1.3.1.1
  - FN-1.3.1.2
  - FN-1.3.1.3
---

# CMP-1.3.1: Candidacy Service

## Responsibility

The Candidacy Service is responsible for managing the lifecycle of candidate applications for a listing. The system shall verify each candidate's status via TrustGate before accepting a submission, reject candidacies with missing or expired verifications, and display which verifications are outstanding. The system shall accept a personal statement (max 2000 characters) and optional move-in date, confirm receipt via notification within 60 seconds, prevent duplicate candidacies, and record the verification snapshot immutably. The system shall support candidacy withdrawal at any time before the landlord decision is finalized.

## Interfaces

- **Inbound:** Candidate UI (submit/withdraw candidacy), Listing Service (listing status query)
- **Outbound:** TrustGate API (verification status check), Notification Service (confirmation/withdrawal alerts), Ranking Engine (candidacy events), Audit Service (candidacy lifecycle events)

## Functions

| ID | Title |
|---|---|
| FN-1.3.1.1 | Submit Candidacy |
| FN-1.3.1.2 | Withdraw Candidacy |
| FN-1.3.1.3 | Capture Verification Snapshot |

## Constraints

- Personal statement max 2000 characters.
- TrustGate must return verified status for identity, income, and credit.
- Verification snapshot is immutable once recorded.
- One candidacy per user per listing.

## Infrastructure References

- INF-1 (PostgreSQL — candidacy records)
- INF-2 (Redis — TrustGate response caching)
- INF-5 (Notification infrastructure)