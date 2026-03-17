---
type: Component
id: CMP-1.6.1
title: "Decision Tracker"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.6
functions:
  - FN-1.6.1.1
  - FN-1.6.1.2
---

# CMP-1.6.1: Decision Tracker

## Responsibility

The Decision Tracker is responsible for recording and managing the landlord's lease decision. The system shall allow the owner to select a candidate, notify the chosen and non-selected candidates, transition the search to completed or closed-unfilled, record outcomes for analytics, and retain data for 3 years.

## Interfaces

- **Inbound:** Owner UI (select candidate, close search)
- **Outbound:** Notification Service (outcome notifications), Pool Service (release candidates back to pool), Analytics (conversion tracking), Audit Service

## Functions

| ID | Title |
|---|---|
| FN-1.6.1.1 | Record Lease Decision |
| FN-1.6.1.2 | Close Search Without Selection |

## Constraints

- Only one candidate can be selected per search.
- Non-selected candidates returned to pool (still available for other searches).
- Data retention: 3 years.
- Search transitions to terminal state after decision.

## Infrastructure References

- INF-1 (PostgreSQL — decision records)
- INF-3 (Notification infrastructure)