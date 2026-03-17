---
type: Function
id: FN-1.7.1.2
title: "Process Consent Revocation"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.7.1
---

# FN-1.7.1.2: Process Consent Revocation

## Functional Description

- The system shall allow users to revoke specific consent grants (per recipient, per data type).
- The system shall create a new immutable consent record with "revoked" status, preserving the original grant.
- The system shall process revocation within 1 hour of submission.
- The system shall immediately block further data access for the revoked data types by the affected recipient.
- The system shall notify the affected B2B client of the revocation, specifying which data types are no longer accessible.
- The system shall cancel any in-progress verification checks that depend on the revoked consent.

## Preconditions

- An active consent grant exists for the specified recipient and data types.

## Behavior

1. User submits revocation request.
2. System creates "revoked" consent record.
3. System blocks data access for affected recipient.
4. System cancels dependent in-progress checks.
5. System notifies B2B client.
6. System emits audit event.

## Postconditions

- Consent is revoked (new immutable record).
- Data access blocked within 1 hour.
- B2B client notified.

## Error Handling

- The system shall return HTTP 404 if no active consent exists for the specified combination.
- The system shall handle revocation of already-revoked consent idempotently.