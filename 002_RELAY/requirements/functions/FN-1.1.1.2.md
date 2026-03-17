---
type: Function
id: FN-1.1.1.2
title: "Handle In-App Approval Request"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.1.1
---

# FN-1.1.1.2: Handle In-App Approval Request

## Functional Description

- The system shall create an approval request record linked to the listing and the landlord's identity.
- The system shall send a notification to the landlord containing a signed, time-limited link to the approval response page.
- The system shall accept the landlord's approve or reject response via the response endpoint.
- The system shall validate the response token's signature and expiration before processing.
- The system shall record the landlord's decision (approve/reject) with timestamp and identity.
- The system shall transition the listing's approval status to "approved" or "rejected" accordingly.
- The system shall notify the listing tenant of the landlord's decision.

## Preconditions

- The listing exists in "draft" state.
- The landlord is registered on the platform and linked to the property.
- No prior approval is already on file.

## Behavior

1. Tenant triggers an in-app approval request for the listing.
2. System creates the approval request and sends notification to landlord with signed link.
3. Landlord clicks link, lands on response page, selects approve or reject.
4. System validates token, records decision, updates listing approval status.
5. System notifies tenant of outcome.
6. System emits audit event.

## Postconditions

- The landlord's response is recorded immutably.
- The listing approval status reflects the landlord's decision.
- The tenant is notified of the outcome.
- An audit entry exists for the approval response.

## Error Handling

- The system shall return HTTP 410 (Gone) if the approval link has expired (> 14 days).
- The system shall return HTTP 400 (Bad Request) if the token signature is invalid.
- The system shall return HTTP 409 (Conflict) if the landlord has already responded.
- The system shall return HTTP 404 (Not Found) if the listing or landlord reference is invalid.
- The system shall retry notification delivery up to 3 times with exponential backoff if the initial send fails.