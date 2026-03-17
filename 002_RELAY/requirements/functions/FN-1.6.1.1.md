---
type: Function
id: FN-1.6.1.1
title: "Process Cancellation Request"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.6.1
---

# FN-1.6.1.1: Process Cancellation Request

## Functional Description

- The system shall accept a cancellation request from the listing tenant at any stage of the listing lifecycle.
- The system shall require the tenant to select a reason from a predefined list: "lease terminated by landlord", "personal circumstances", "legal dispute", "other".
- The system shall require a free-text explanation of at least 50 characters when "other" is selected.
- The system shall transition the listing to the terminal "cancelled" state.
- The system shall notify all active candidates of the cancellation within 1 hour, including the reason category but not the free text.
- The system shall notify the landlord with full cancellation details including free text.
- The system shall increment the tenant's cancellation counter.
- The system shall emit an audit event for the cancellation.

## Preconditions

- The listing exists and is not already in a terminal state (completed or cancelled).
- The tenant is authenticated and is the listing owner.

## Behavior

1. Tenant submits cancellation request with reason and optional free text.
2. System validates reason selection and free-text requirement.
3. System transitions listing to "cancelled".
4. System dispatches candidate notifications (within 1 hour SLA).
5. System dispatches landlord notification with full details.
6. System increments tenant cancellation counter.
7. System emits audit event.

## Postconditions

- The listing is in terminal "cancelled" state.
- All active candidates and the landlord are notified.
- The cancellation counter is incremented.
- All data is retained for minimum 3 years.

## Error Handling

- The system shall return HTTP 400 if "other" is selected and free text is fewer than 50 characters.
- The system shall return HTTP 409 if the listing is already in a terminal state.
- The system shall queue notifications for retry if the notification service is unavailable, ensuring the 1-hour SLA.