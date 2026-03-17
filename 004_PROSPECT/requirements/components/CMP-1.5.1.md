---
type: Component
id: CMP-1.5.1
title: "Viewing Scheduler"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.5
functions:
  - FN-1.5.1.1
  - FN-1.5.1.2
---

# CMP-1.5.1: Viewing Scheduler

## Responsibility

The Viewing Scheduler is responsible for coordinating property viewings between owners and matched candidates. The system shall allow owners to propose time slots, candidates to select or counter-propose, send booking confirmations and 24-hour reminders, support cancellation/rescheduling with 12-hour notice, track attendance, and allow private viewing notes.

## Interfaces

- **Inbound:** Owner UI (time slots, notes), Candidate UI (slot selection, counter-proposals)
- **Outbound:** Notification Service (confirmations, reminders), Decision Tracker (viewing outcome data)

## Functions

| ID | Title |
|---|---|
| FN-1.5.1.1 | Manage Viewing Slots |
| FN-1.5.1.2 | Track Viewing Attendance |

## Constraints

- Cancellation/rescheduling requires 12-hour notice.
- Viewing notes are private to the owner (never shared with candidate).
- Reminder sent 24 hours before viewing.

## Infrastructure References

- INF-1 (PostgreSQL — viewing records)
- INF-3 (Notification infrastructure)