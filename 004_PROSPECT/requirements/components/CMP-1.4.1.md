---
type: Component
id: CMP-1.4.1
title: "Shortlist Service"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.4
functions:
  - FN-1.4.1.1
  - FN-1.4.1.2
---

# CMP-1.4.1: Shortlist Service

## Responsibility

The Shortlist Service is responsible for assembling, delivering, and managing the candidate shortlist. The system shall select the top N candidates, display privacy-preserving profiles (badges, score, preferences — no identity), deliver via dashboard and email within 24 hours, support approve/dismiss actions, implement mutual match confirmation before revealing contact details, and trigger re-matching when requested.

## Interfaces

- **Inbound:** Matching Engine (ranked results), Owner UI (approve/dismiss), Candidate UI (match confirmation)
- **Outbound:** Notification Service (delivery, match), Pool Service (candidate profile), Viewing Scheduler (confirmed matches)

## Functions

| ID | Title |
|---|---|
| FN-1.4.1.1 | Assemble and Deliver Shortlist |
| FN-1.4.1.2 | Process Mutual Match |

## Constraints

- Default shortlist size: 10, configurable 3-20.
- Delivery SLA: < 24 hours from search creation.
- Contact details revealed only after mutual match.
- Re-matching allowed once per search (prevent gaming).

## Infrastructure References

- INF-1 (PostgreSQL — shortlist records)
- INF-3 (Notification infrastructure)