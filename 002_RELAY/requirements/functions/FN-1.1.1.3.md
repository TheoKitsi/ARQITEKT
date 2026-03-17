---
type: Function
id: FN-1.1.1.3
title: "Revoke Landlord Approval"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.1.1
---

# FN-1.1.1.3: Revoke Landlord Approval

## Functional Description

- The system shall allow the landlord to revoke a previously granted approval for a listing.
- The system shall validate that the listing has not yet received its first candidacy before allowing revocation.
- The system shall transition the listing from "published" back to "draft" (unpublished) upon revocation.
- The system shall record the revocation event with timestamp and landlord identity.
- The system shall notify the listing tenant of the revocation with a clear explanation.

## Preconditions

- The listing has an approved status (document-uploaded or in-app approved).
- The listing has zero candidacies.
- The landlord is authenticated.

## Behavior

1. Landlord submits a revocation request via the API.
2. System validates zero-candidacy prerequisite.
3. System transitions listing back to "draft" and marks approval as "revoked".
4. System notifies listing tenant.
5. System emits audit event.

## Postconditions

- The listing is no longer published.
- The approval record is marked as "revoked" (original approval data preserved).
- The tenant is notified.
- An audit entry exists for the revocation.

## Error Handling

- The system shall return HTTP 409 (Conflict) if the listing already has candidacies.
- The system shall return HTTP 403 (Forbidden) if the authenticated user is not the linked landlord.
- The system shall return HTTP 404 (Not Found) if the listing or approval record does not exist.