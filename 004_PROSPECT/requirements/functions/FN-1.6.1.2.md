---
type: Function
id: FN-1.6.1.2
title: "Close Search Without Selection"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.6.1
---

# FN-1.6.1.2: Close Search Without Selection

## Functional Description

- The system shall allow the owner to close a search without selecting a tenant.
- The system shall require a reason (no suitable candidates, property withdrawn, other).
- The system shall notify all shortlisted candidates that the search has been closed.
- The system shall return all candidates to the active pool.
- The system shall transition the search to `closed-unfilled` status.

## Preconditions

- Search is in any non-terminal status.

## Behavior

1. Owner requests search closure with reason code.
2. Persist closure record with reason and timestamp.
3. Send closure notifications to all shortlisted/matched candidates.
4. Release all candidates back to active pool.
5. Set search status to `closed-unfilled`.
6. Record closure for platform analytics.

## Postconditions

- Search in terminal `closed-unfilled` state.
- All candidates returned to pool.
- Closure reason logged for analytics.

## Error Handling

- The system shall return `409 Conflict` when the search is already in a terminal state.
- The system shall warn if a mutual match exists and require confirmation before closing.