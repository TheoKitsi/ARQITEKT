---
type: Function
id: FN-1.2.1.1
title: "Execute eID NFC Verification"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.2.1
---

# FN-1.2.1.1: Execute eID NFC Verification

## Functional Description

- The system shall detect NFC hardware availability on the user's device before initiating the flow.
- The system shall redirect users without NFC to the Alternative Identity Provider.
- The system shall initiate an AusweisApp2 SDK session for eID card reading.
- The system shall guide the user through PIN entry, card placement, and data reading.
- The system shall extract only minimum required attributes (full name, date of birth, nationality) from the eID chip.
- The system shall encrypt extracted attributes using AES-256 and store them in the encrypted identity store.
- The system shall generate an identity badge with "verified" status and configurable expiration (default: 12 months).
- The system shall emit audit events for attempt start, success, and failure.

## Preconditions

- User has a valid German eID with activated eID function.
- User's device has NFC capability (detected).
- Valid consent for identity verification on file.

## Behavior

1. System detects NFC hardware.
2. System initiates AusweisApp2 session.
3. User enters PIN and places card.
4. System reads chip data.
5. System extracts minimal attributes, encrypts, stores.
6. System generates identity badge.
7. System updates order status.

## Postconditions

- Encrypted identity attributes stored.
- Identity badge generated with expiration.
- Order module status updated to "complete".

## Error Handling

- The system shall return a user-friendly error if NFC reading fails (card removed too early, PIN wrong) with retry guidance.
- The system shall lock the flow after 3 failed PIN attempts and redirect to alternative identification.
- The system shall redirect to alternative identification if NFC hardware is absent.
- The system shall save resumption state if the app is backgrounded or the connection drops.