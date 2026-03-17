---
type: Function
id: FN-1.3.1.3
title: "Capture Verification Snapshot"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.3.1
---

# FN-1.3.1.3: Capture Verification Snapshot

## Functional Description

- The system shall query TrustGate for the candidate's current verification statuses (identity, income, credit) at the moment of candidacy submission.
- The system shall record each verification's status (verified, expired, missing), verification date, and expiration date as a JSON snapshot.
- The system shall store the snapshot immutably alongside the candidacy record, ensuring it cannot be modified after creation.
- The system shall use the snapshot for all subsequent badge rendering and score calculations, not the live TrustGate status.

## Preconditions

- TrustGate API is reachable.
- The candidate has at least one verification on file.

## Behavior

1. System calls TrustGate API with candidate ID.
2. System receives verification statuses.
3. System constructs snapshot JSON with status, dates, and badge levels.
4. System stores snapshot in immutable column linked to candidacy.

## Postconditions

- An immutable verification snapshot is stored with the candidacy.
- The snapshot contains identity, income, and credit verification data.

## Error Handling

- The system shall return HTTP 503 (Service Unavailable) if TrustGate is unreachable.
- The system shall not create a partial snapshot; all three verification types must be queried successfully or the operation fails atomically.