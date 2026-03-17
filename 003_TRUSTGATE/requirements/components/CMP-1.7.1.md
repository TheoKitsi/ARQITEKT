---
type: Component
id: CMP-1.7.1
title: "Consent Service"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.7
functions:
  - FN-1.7.1.1
  - FN-1.7.1.2
---

# CMP-1.7.1: Consent Service

## Responsibility

The Consent Service is responsible for managing user consent for data processing and sharing. The system shall store consent records as versioned, timestamped, immutable documents, support granular consent per recipient and data type, enforce consent prerequisite for all external data queries, process revocation within 1 hour, notify affected B2B clients on revocation, and present consent requests in plain language.

## Interfaces

- **Inbound:** End User UI (grant/revoke consent), Order Service (consent check), Credit Orchestrator (consent check)
- **Outbound:** B2B Client notification (revocation alerts), Audit Service (consent events)

## Functions

| ID | Title |
|---|---|
| FN-1.7.1.1 | Manage Consent Grants |
| FN-1.7.1.2 | Process Consent Revocation |

## Constraints

- Consent records are append-only; revocation creates a new record, original preserved.
- Revocation processing SLA: < 1 hour.
- No external data query without valid consent (hard gate).
- Plain language consent descriptions mandatory.

## Infrastructure References

- INF-1 (PostgreSQL — consent records)