---
type: Function
id: FN-1.3.1.1
title: "Submit Candidacy"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.3.1
---

# FN-1.3.1.1: Submit Candidacy

## Functional Description

- The system shall accept a candidacy submission from an authenticated candidate for a published listing.
- The system shall call the TrustGate API to check the candidate's verification status for identity, income, and credit.
- The system shall reject the candidacy if any required verification is missing or expired, returning a clear list of outstanding verifications.
- The system shall check for an existing candidacy by the same user for the same listing and reject duplicates.
- The system shall accept a personal statement (max 2000 characters) and an optional preferred move-in date.
- The system shall capture a verification snapshot (badge states at submission time) and store it immutably with the candidacy record.
- The system shall confirm receipt to the candidate via email and in-app notification within 60 seconds.
- The system shall emit a "candidacy submitted" event for the Ranking Engine and Audit Service.

## Preconditions

- The listing is in "published" state.
- The candidate is authenticated and not the listing owner or linked landlord.
- No existing candidacy by this user for this listing.

## Behavior

1. Candidate submits candidacy with personal statement and optional move-in date.
2. System calls TrustGate to verify identity, income, credit status.
3. If any verification missing/expired: reject with list of outstanding items.
4. System checks for duplicate candidacy.
5. System creates candidacy record with verification snapshot.
6. System triggers confirmation notification.
7. System emits events to Ranking Engine and Audit Service.
8. System returns candidacy ID.

## Postconditions

- A candidacy record exists with immutable verification snapshot.
- The candidate received a confirmation notification.
- The Ranking Engine has been notified.
- An audit entry exists for the submission.

## Error Handling

- The system shall return HTTP 422 (Unprocessable Entity) with a list of outstanding verifications if TrustGate returns incomplete status.
- The system shall return HTTP 409 (Conflict) if a candidacy already exists for this user and listing.
- The system shall return HTTP 400 (Bad Request) if the personal statement exceeds 2000 characters.
- The system shall return HTTP 403 (Forbidden) if the user is the listing owner or linked landlord.
- The system shall return HTTP 503 (Service Unavailable) if TrustGate is unreachable, with a Retry-After header.
- The system shall revert the candidacy record if the notification dispatch fails and retry the full operation.