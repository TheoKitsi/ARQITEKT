---
type: Function
id: FN-1.10.1.3
title: "Process Correction Request"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.10.1
---

# FN-1.10.1.3: Process Correction Request

## Functional Description

- The system shall accept a data correction request from an authenticated data subject specifying which data is incorrect and the proposed correction.
- The system shall route the request to a platform operator for review if the correction affects verification results.
- The system shall automatically apply corrections for non-sensitive fields (contact email, phone number) and submit for manual review for sensitive fields (name, DOB from eID).
- The system shall re-trigger affected verifications if corrected data invalidates existing badges.
- The system shall respond to the subject within 72 hours.
- The system shall log the original value, corrected value, and reviewing operator in the audit trail.

## Preconditions

- The data subject is authenticated.
- Specific data to correct is identified.

## Behavior

1. Subject submits correction request with details.
2. System classifies as auto-correctable or manual-review.
3. Auto: applies correction, logs, notifies subject.
4. Manual: routes to operator, operator approves/rejects, system applies if approved.
5. If badges affected: re-verification triggered.

## Postconditions

- Data corrected (or request rejected with reason).
- Audit trail updated with change history.

## Error Handling

- The system shall return HTTP 400 if the correction request is incomplete.
- The system shall notify the subject if the correction is rejected, with explanation.