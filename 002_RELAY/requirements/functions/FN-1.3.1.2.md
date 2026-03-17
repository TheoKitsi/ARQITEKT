---
type: Function
id: FN-1.3.1.2
title: "Withdraw Candidacy"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.3.1
---

# FN-1.3.1.2: Withdraw Candidacy

## Functional Description

- The system shall allow a candidate to withdraw their candidacy at any time before the landlord's final decision is recorded.
- The system shall transition the candidacy status to "withdrawn" with a timestamp.
- The system shall notify the listing tenant and trigger a ranking recalculation.
- The system shall emit an audit event for the withdrawal.

## Preconditions

- A candidacy exists for this user and listing.
- The candidacy is in "submitted" or "shortlisted" status (not yet accepted/rejected).

## Behavior

1. Candidate submits withdrawal request.
2. System validates candidacy status allows withdrawal.
3. System transitions status to "withdrawn".
4. System notifies listing tenant.
5. System emits event to Ranking Engine for recalculation.
6. System emits audit event.

## Postconditions

- The candidacy status is "withdrawn".
- The ranking has been recalculated without this candidate.
- The listing tenant is notified.

## Error Handling

- The system shall return HTTP 409 (Conflict) if the candidacy has already been accepted or rejected by the landlord.
- The system shall return HTTP 404 (Not Found) if no candidacy exists for this user and listing.