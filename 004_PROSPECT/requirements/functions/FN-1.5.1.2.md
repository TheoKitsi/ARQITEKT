---
type: Function
id: FN-1.5.1.2
title: "Track Viewing Attendance"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.5.1
---

# FN-1.5.1.2: Track Viewing Attendance

## Functional Description

- The system shall allow the owner to record attendance status after a viewing: attended, no-show, or rescheduled.
- The system shall allow the owner to add private viewing notes (not visible to candidates).
- The system shall update the candidate's match record with viewing outcome data.

## Preconditions

- Viewing record exists with status `booked` and viewing time has passed.

## Behavior

1. After viewing time + 1 hour buffer, prompt owner for attendance confirmation.
2. Owner marks attendance status and optionally adds notes.
3. Persist attendance record and private notes.
4. Update candidate match status (viewed, no-show).
5. Feed attendance data to Decision Tracker for informed decisions.

## Postconditions

- Attendance status recorded.
- Private notes stored (encrypted at rest).
- Match record updated with viewing outcome.

## Error Handling

- The system shall auto-prompt for attendance if not recorded within 48 hours.
- The system shall default to `unknown` if owner does not respond within 7 days.