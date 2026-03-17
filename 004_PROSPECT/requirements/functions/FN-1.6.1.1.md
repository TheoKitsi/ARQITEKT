---
type: Function
id: FN-1.6.1.1
title: "Record Lease Decision"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.6.1
---

# FN-1.6.1.1: Record Lease Decision

## Functional Description

- The system shall allow the owner to select one candidate as the chosen tenant.
- The system shall notify the chosen candidate with a congratulations message.
- The system shall notify all non-selected candidates with a polite rejection and return them to the pool.
- The system shall transition the search to `completed` status.
- The system shall record the decision for analytics (conversion tracking, time-to-fill).

## Preconditions

- At least one viewing has been completed for the search.
- Search is in `viewings-scheduled` status or later.

## Behavior

1. Owner selects candidate from viewed list.
2. Validate candidate is still active (not deactivated since viewing).
3. Persist decision record with timestamp and owner notes.
4. Send acceptance notification to chosen candidate.
5. Send rejection notifications to other shortlisted candidates.
6. Release non-selected candidates back to active pool.
7. Set search status to `completed`.

## Postconditions

- Search in terminal `completed` state.
- Chosen candidate notified.
- Non-selected candidates returned to pool.
- Analytics event recorded.

## Error Handling

- The system shall return `409 Conflict` when the candidate has been selected for another property between viewing and decision.
- The system shall return `404 Not Found` when the candidate profile no longer exists.
- The system shall allow decision reversal within 24 hours (grace period).