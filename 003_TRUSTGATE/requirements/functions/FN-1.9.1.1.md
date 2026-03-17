---
type: Function
id: FN-1.9.1.1
title: "Scan and Notify Expirations"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.9.1
---

# FN-1.9.1.1: Scan and Notify Expirations

## Functional Description

- The system shall run a daily scan of all active badges to identify those expiring within 30 days.
- The system shall send a single notification per badge per expiration cycle (no repeated notifications for the same upcoming expiry).
- The system shall notify the user with a link to initiate re-verification.
- The system shall notify the ordering B2B client of upcoming expirations for their subjects.
- The system shall transition badges past their expiration date to "expired" status.

## Preconditions

- Badge records exist with expiration dates.

## Behavior

1. Daily job queries badges expiring within 30 days.
2. System sends notifications to users and clients (one per badge, deduplicated).
3. System transitions expired badges to "expired" status.
4. System recalculates composite scores for affected subjects.

## Postconditions

- Approaching expirations notified.
- Expired badges transitioned.
- Composite scores updated.

## Error Handling

- The system shall log and skip badges with invalid expiration dates.
- The system shall retry failed notifications in the next daily run.