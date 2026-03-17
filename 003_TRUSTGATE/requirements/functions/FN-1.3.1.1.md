---
type: Function
id: FN-1.3.1.1
title: "Execute Alternative Identification"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.3.1
---

# FN-1.3.1.1: Execute Alternative Identification

## Functional Description

- The system shall redirect the user to a certified video-ident provider's session.
- The system shall receive the verification result via callback/webhook from the provider.
- The system shall validate the callback signature to prevent spoofing.
- The system shall extract only minimum required attributes (full name, date of birth, nationality), matching the eID data model.
- The system shall generate an identity badge with "verified" status, configurable expiration, and method metadata ("video-ident").
- The system shall display the security level equivalence to the user before starting.
- The system shall emit audit events for attempt, callback receipt, and outcome.

## Preconditions

- User has been redirected from eID flow (NFC absent or PIN lockout) or has chosen alternative method.
- Valid consent for identity verification on file.

## Behavior

1. System displays security level equivalence information.
2. System redirects user to video-ident provider.
3. Provider completes identification and sends callback.
4. System validates callback signature.
5. System extracts attributes, generates badge.
6. System updates order status.

## Postconditions

- Identity badge generated with method metadata "video-ident".
- Badge structure identical to eID badge.
- Order module status updated.

## Error Handling

- The system shall reject callbacks with invalid signatures and alert ops.
- The system shall handle provider timeouts by setting badge to "pending" and notifying the user.
- The system shall support manual override by platform operator if video-ident fails repeatedly.