---
type: Function
id: FN-1.8.1.1
title: "Record Audit Event"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.8.1
---

# FN-1.8.1.1: Record Audit Event

## Functional Description

- The system shall accept audit events from all platform components via an internal event bus or API.
- The system shall record each event with: event ID (UUID), timestamp (UTC), actor ID, actor role, event type, entity type (listing/candidacy/approval), entity ID, payload (JSON), and previous event hash.
- The system shall compute a SHA-256 hash of the current event record and store it for hash chain integrity.
- The system shall insert the event into an append-only table; no UPDATE or DELETE operations are permitted on this table.
- The system shall ensure write durability with synchronous replication.

## Preconditions

- The audit event payload is well-formed.
- The database connection is available.

## Behavior

1. Component emits audit event to the Audit Service.
2. System retrieves the hash of the most recent event for the same entity.
3. System computes SHA-256 hash of the new event concatenated with the previous hash.
4. System inserts the event into the append-only table.
5. System returns the event ID.

## Postconditions

- The event is durably stored in the append-only table.
- The hash chain is extended by one entry.

## Error Handling

- The system shall queue events for retry if the database is temporarily unavailable (max 3 retries, exponential backoff).
- The system shall alert ops if an event cannot be written after all retries.
- The system shall never silently drop an audit event.