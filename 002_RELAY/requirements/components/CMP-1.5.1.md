---
type: Component
id: CMP-1.5.1
title: "Decision Workflow"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.5
functions:
  - FN-1.5.1.1
  - FN-1.5.1.2
  - FN-1.5.1.3
---

# CMP-1.5.1: Decision Workflow

## Responsibility

The Decision Workflow is responsible for orchestrating the landlord's successor selection process. The system shall present the landlord with a shortlist of the top N candidates (configurable, default 3) including badges, score breakdown, and personal statement. The system shall allow the landlord to accept or reject candidates with mandatory reason selection, automatically promote the next runner-up upon rejection or withdrawal, enforce a decision deadline with escalation, and validate that the accepted candidate's verification has not expired. The system shall record all decisions with timestamp, reason, and identity in the audit trail and notify accepted and rejected candidates.

## Interfaces

- **Inbound:** Ranking Engine (shortlist), Landlord UI (accept/reject actions)
- **Outbound:** Notification Service (candidate outcome, deadline reminders), Candidacy Service (withdraw/promote events), TrustGate API (verification freshness check), Audit Service (decision events)

## Functions

| ID | Title |
|---|---|
| FN-1.5.1.1 | Present Shortlist to Landlord |
| FN-1.5.1.2 | Process Landlord Decision |
| FN-1.5.1.3 | Promote Runner-Up |

## Constraints

- Default shortlist size: 3 candidates, configurable between 1 and 10.
- Decision deadline default: 7 days, configurable between 3 and 30 days.
- Rejection requires reason from predefined list + optional free text.
- Expired verification blocks acceptance.

## Infrastructure References

- INF-1 (PostgreSQL — decision records)
- INF-5 (Notification infrastructure)
- INF-6 (Scheduled jobs — deadline enforcement)