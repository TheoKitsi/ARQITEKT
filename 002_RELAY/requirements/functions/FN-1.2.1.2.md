---
type: Function
id: FN-1.2.1.2
title: "Lock Criteria Catalog"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.2.1
---

# FN-1.2.1.2: Lock Criteria Catalog

## Functional Description

- The system shall automatically lock the criteria catalog when the first candidacy for the listing is received.
- The system shall set a "locked" flag on the catalog record and record the lock timestamp and triggering candidacy ID.
- The system shall reject any subsequent modification attempts to the catalog while the lock is active.
- The system shall emit an audit event documenting the lock.

## Preconditions

- The criteria catalog exists and has at least one active criterion.
- The catalog is currently unlocked.
- A candidacy has been submitted.

## Behavior

1. Candidacy Service emits a "first candidacy received" event.
2. Criteria Engine receives the event and sets the lock flag with timestamp and candidacy reference.
3. System emits audit event.

## Postconditions

- The catalog is immutable for the remainder of the listing lifecycle.
- An audit entry records the lock event.

## Error Handling

- The system shall log a warning and take no action if the lock event is received for an already-locked catalog (idempotent).
- The system shall return HTTP 409 (Conflict) for any catalog edit attempt after lock.