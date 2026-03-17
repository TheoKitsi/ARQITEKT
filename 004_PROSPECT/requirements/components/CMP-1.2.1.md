---
type: Component
id: CMP-1.2.1
title: "Pool Service"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.2
functions:
  - FN-1.2.1.1
  - FN-1.2.1.2
---

# CMP-1.2.1: Pool Service

## Responsibility

The Pool Service is responsible for managing the candidate matching pool. The system shall allow TrustGate-verified users to create matching profiles with location, budget, preferences, and availability. The system shall synchronize badge states from TrustGate in near real time, exclude candidates with expired badges, support profile pause/deactivation, enforce Prospect-specific consent, and protect candidate identity until mutual match.

## Interfaces

- **Inbound:** Candidate UI (profile CRUD), TrustGate API (badge sync)
- **Outbound:** Matching Engine (candidate data), Consent records, Audit Service

## Functions

| ID | Title |
|---|---|
| FN-1.2.1.1 | Manage Pool Profile |
| FN-1.2.1.2 | Sync Badge States |

## Constraints

- Only TrustGate-verified candidates can create pool profiles.
- Badge sync delay: max 5 minutes.
- Candidate identity hidden until mutual match confirmation.
- Prospect consent separate from TrustGate consent.

## Infrastructure References

- INF-1 (PostgreSQL — pool profiles)
- INF-2 (Redis — badge state cache)