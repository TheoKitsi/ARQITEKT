---
type: Function
id: FN-1.7.1.1
title: "Manage Consent Grants"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.7.1
---

# FN-1.7.1.1: Manage Consent Grants

## Functional Description

- The system shall present the user with a consent form listing each data type and recipient in plain language.
- The system shall accept granular consent decisions: per recipient, per data type (identity badge, income badge, credit badge, composite score).
- The system shall create an immutable, versioned consent record with: user ID, recipient ID, data types, grant/deny, timestamp, version number.
- The system shall never overwrite existing consent records; new grants create new versions.
- The system shall make consent records available for upstream checks (Order Service, Credit Orchestrator).

## Preconditions

- User is authenticated.
- Consent form content is configured for the requesting context.

## Behavior

1. System presents consent form with recipient and data type details.
2. User grants or denies consent per data type.
3. System creates versioned consent record.
4. System confirms consent to user.

## Postconditions

- Immutable consent record exists.
- Consent available for prerequisite checks.

## Error Handling

- The system shall return HTTP 400 if consent form submission is incomplete.
- The system shall handle concurrent consent updates by versioning (optimistic locking).