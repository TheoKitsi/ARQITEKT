---
type: Function
id: FN-1.2.1.1
title: "Manage Pool Profile"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.2.1
---

# FN-1.2.1.1: Manage Pool Profile

## Functional Description

- The system shall allow TrustGate-verified candidates to create a matching profile with preferred locations, budget range, move-in timeline, and lifestyle preferences.
- The system shall validate that the candidate holds at least one active TrustGate badge before profile creation.
- The system shall support profile update, pause, and deactivation.
- The system shall enforce Prospect-specific consent before activating the profile in the pool.

## Preconditions

- Candidate has at least one active TrustGate badge.
- Candidate has granted Prospect-specific data consent.

## Behavior

1. Validate TrustGate badge status via API; reject with `403 Forbidden` if no active badge.
2. Check Prospect consent record; redirect to consent flow if missing.
3. Create or update profile in PostgreSQL.
4. Index active profile in matching pool (Redis cache for fast lookup).
5. Return profile confirmation.

## Postconditions

- Profile stored and indexed for matching.
- Consent record linked to profile.
- Audit log entry written.

## Error Handling

- The system shall return `403 Forbidden` when the candidate has no active TrustGate badge.
- The system shall return `400 Bad Request` when required profile fields are missing.
- The system shall return `409 Conflict` when an active profile already exists (update instead).
- The system shall return `503 Service Unavailable` when TrustGate API is unreachable.