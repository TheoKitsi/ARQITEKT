---
type: Function
id: FN-1.10.1.2
title: "Process Deletion Request"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.10.1
---

# FN-1.10.1.2: Process Deletion Request

## Functional Description

- The system shall accept a data deletion request from an authenticated data subject.
- The system shall cancel all active verification orders for the subject.
- The system shall revoke all active consent grants.
- The system shall apply retention rules per data type: data beyond retention period is permanently deleted; data within mandatory retention periods (audit records, legal holds) is anonymized.
- The system shall delete uploaded documents from encrypted storage.
- The system shall notify affected B2B clients that the subject's data has been deleted.
- The system shall respond to the subject within 72 hours.

## Preconditions

- The data subject is authenticated.

## Behavior

1. Subject submits deletion request.
2. System cancels active orders.
3. System revokes all consents.
4. System applies retention rules.
5. System deletes / anonymizes data.
6. System notifies B2B clients.
7. System confirms completion to subject.

## Postconditions

- Personal data deleted or anonymized per retention rules.
- Active orders cancelled, consents revoked.
- B2B clients notified.

## Error Handling

- The system shall not delete data under legal hold; subject informed of retained categories.
- The system shall handle partial deletion failures by retrying and escalating to ops if needed.