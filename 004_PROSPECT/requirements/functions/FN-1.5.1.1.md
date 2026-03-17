---
type: Function
id: FN-1.5.1.1
title: "Manage Viewing Slots"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.5.1
---

# FN-1.5.1.1: Manage Viewing Slots

## Functional Description

- The system shall allow owners to propose viewing time slots (date, start time, duration).
- The system shall allow candidates to select a proposed slot or submit a counter-proposal.
- The system shall send booking confirmations to both parties upon slot selection.
- The system shall send a reminder notification 24 hours before each viewing.
- The system shall support cancellation with minimum 12-hour notice and rescheduling.

## Preconditions

- Mutual match has been confirmed between owner and candidate.
- At least one time slot has been proposed.

## Behavior

1. Owner proposes one or more time slots via UI.
2. Candidate selects a slot or proposes alternative times.
3. Upon agreement, persist viewing record with status `booked`.
4. Schedule 24-hour reminder notification.
5. On cancellation (>12h notice), release slot and notify other party.
6. On late cancellation (<12h), record as `late-cancel` and notify.

## Postconditions

- Viewing record persisted with agreed time.
- Confirmation and reminder notifications scheduled.
- Cancellation history tracked.

## Error Handling

- The system shall return `400 Bad Request` when proposed time is in the past.
- The system shall return `409 Conflict` when the slot is already booked by another candidate.
- The system shall return `422 Unprocessable Entity` when cancellation is attempted less than 12 hours before viewing (soft block with warning).