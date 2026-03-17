---
type: Component
id: CMP-1.2.1
title: "eID Engine"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.2
functions:
  - FN-1.2.1.1
  - FN-1.2.1.2
---

# CMP-1.2.1: eID Engine

## Responsibility

The eID Engine is responsible for orchestrating the eID/NFC identity verification flow. The system shall integrate with the AusweisApp2 SDK, manage the NFC reading session on mobile devices, save secure resumption states on interruption, extract minimum required identity attributes (name, DOB, nationality), encrypt and store them, generate identity badges with expiration dates, and detect NFC hardware absence to redirect users. The system shall emit audit events for all verification attempts.

## Interfaces

- **Inbound:** End User mobile app (eID flow), Order Service (trigger identity check)
- **Outbound:** AusweisApp2 SDK (eID reading), Badge Service (badge generation), Audit Service, Notification Service

## Functions

| ID | Title |
|---|---|
| FN-1.2.1.1 | Execute eID NFC Verification |
| FN-1.2.1.2 | Manage Resumption State |

## Constraints

- Only minimum identity attributes extracted (data minimization).
- Attributes encrypted at rest (AES-256) and in transit (TLS 1.3).
- Resumption state expires after 30 minutes.
- NFC hardware detection must occur before starting the flow.

## Infrastructure References

- INF-1 (PostgreSQL — verification records)
- INF-3 (Encrypted storage — identity attributes)
- INF-4 (Mobile SDK integration)