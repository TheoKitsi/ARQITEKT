---
type: Component
id: CMP-1.8.1
title: "Audit Service"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.8
functions:
  - FN-1.8.1.1
  - FN-1.8.1.2
  - FN-1.8.1.3
---

# CMP-1.8.1: Audit Service

## Responsibility

The Audit Service is responsible for capturing, storing, and providing access to the immutable record of all platform events. The system shall log every listing state transition, candidacy lifecycle event, and landlord approval event with timestamp, actor, and triggering action. The system shall store entries in an append-only data store, implement a hash chain where each entry references the hash of the previous entry to detect tampering, provide a search interface for platform operators to query by listing ID, user ID, event type, or date range, support JSON and CSV export, and retain audit data for a minimum of 10 years.

## Interfaces

- **Inbound:** All components (audit event submissions)
- **Outbound:** Operator UI (search interface, exports), Regulatory Export API (bulk export)

## Functions

| ID | Title |
|---|---|
| FN-1.8.1.1 | Record Audit Event |
| FN-1.8.1.2 | Search Audit Log |
| FN-1.8.1.3 | Export Audit Data |

## Constraints

- Append-only storage; no update or delete operations permitted.
- Hash chain integrity: SHA-256, each entry references previous hash.
- Retention: minimum 10 years per German commercial record-keeping (HGB).
- Search response time: < 2 seconds for queries spanning up to 1 year of data.

## Infrastructure References

- INF-1 (PostgreSQL — append-only audit table)
- INF-7 (Archival storage — long-term retention)