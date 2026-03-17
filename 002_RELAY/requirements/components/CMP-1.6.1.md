---
type: Component
id: CMP-1.6.1
title: "Cancellation Handler"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.6
functions:
  - FN-1.6.1.1
  - FN-1.6.1.2
---

# CMP-1.6.1: Cancellation Handler

## Responsibility

The Cancellation Handler is responsible for managing the exceptional termination of a listing's successor search. The system shall allow the listing tenant to request cancellation at any lifecycle stage by selecting a predefined reason, require a free-text explanation for "other" reasons, notify all active candidates within 1 hour and the landlord with full details, transition the listing to a terminal "cancelled" state, retain all data for 3 years minimum, and increment the tenant's cancellation counter. The system shall alert the platform operator when a tenant exceeds 3 cancellations within 12 months.

## Interfaces

- **Inbound:** Listing Tenant UI (cancellation request)
- **Outbound:** Notification Service (candidate/landlord cancellation alerts), Listing Service (state transition), Audit Service (cancellation event), Operator Alert Service (excessive cancellations)

## Functions

| ID | Title |
|---|---|
| FN-1.6.1.1 | Process Cancellation Request |
| FN-1.6.1.2 | Monitor Cancellation Frequency |

## Constraints

- Free-text explanation mandatory for "other" reason (min 50 characters).
- Cancelled state is terminal and irreversible.
- All data retained for minimum 3 years.
- Operator alert threshold: 3 cancellations per tenant in 12 months.

## Infrastructure References

- INF-1 (PostgreSQL — cancellation records, counters)
- INF-5 (Notification infrastructure)
- INF-6 (Scheduled jobs — retention lifecycle)