---
type: Function
id: FN-1.2.1.2
title: "Manage Resumption State"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.2.1
---

# FN-1.2.1.2: Manage Resumption State

## Functional Description

- The system shall save the current verification step, session token, and timestamp when the flow is interrupted.
- The system shall encrypt the resumption state at rest.
- The system shall allow the user to resume the flow within 30 minutes of interruption.
- The system shall invalidate the resumption state after 30 minutes and require the user to restart.
- The system shall emit an audit event for flow interruption and resumption.

## Preconditions

- An eID verification flow is in progress.
- The flow has been interrupted (app backgrounded, connection lost).

## Behavior

1. Interruption detected.
2. System saves encrypted resumption state with 30-minute TTL.
3. User returns within TTL: system restores state and resumes.
4. User returns after TTL: state expired, restart required.

## Postconditions

- Resumption state is either consumed (resumed) or expired (deleted).

## Error Handling

- The system shall gracefully handle corrupted resumption state by requiring flow restart.
- The system shall log resumption failures for debugging.