---
type: Function
id: FN-1.5.1.2
title: "Process Landlord Decision"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.5.1
---

# FN-1.5.1.2: Process Landlord Decision

## Functional Description

- The system shall accept an accept or reject decision from the landlord for a specific candidate on the shortlist.
- The system shall require a reason selection (from predefined categories) and optional free text for rejections.
- The system shall validate that the candidate's verification has not expired since the candidacy snapshot before processing an acceptance.
- The system shall re-verify the candidate's TrustGate status if the snapshot is older than 30 days.
- The system shall record the decision (accept/reject, reason, timestamp, landlord identity) immutably.
- The system shall notify the affected candidate and the listing tenant of the decision.
- The system shall transition the listing to "completed" upon acceptance.

## Preconditions

- The listing is in "decision-pending" state.
- The landlord is authenticated and linked to the listing property.
- The candidate is on the current shortlist.

## Behavior

1. Landlord submits decision (accept or reject) for a candidate.
2. For acceptance: system checks verification freshness via TrustGate.
3. System records decision immutably.
4. System notifies candidate and listing tenant.
5. For acceptance: system transitions listing to "completed".
6. For rejection: system triggers runner-up promotion if applicable.
7. System emits audit event.

## Postconditions

- The decision is recorded with all metadata.
- All parties are notified.
- The listing state reflects the outcome.

## Error Handling

- The system shall return HTTP 422 (Unprocessable Entity) if verification has expired, instructing the landlord to wait for re-verification.
- The system shall return HTTP 400 if rejection reason is missing.
- The system shall return HTTP 409 if the landlord has already accepted another candidate.
- The system shall return HTTP 403 if the authenticated user is not the linked landlord.