---
type: Conversation
id: CONV-2
title: "Candidate Application Flow"
status: draft
version: "1.0"
date: "2025-07-14"
---

# CONV-2: Candidate Application Flow

## Context

Describes the interaction when a verified candidate applies for a published listing.

## Actors

- **Candidate** — Applies for the listing
- **System** — Validates verification, records candidacy, triggers ranking
- **TrustGate** — Provides verification status

## Flow

1. **Candidate** browses published listings and selects one.
2. **System** displays listing details with criteria catalog and requirements.
3. **Candidate** clicks "Apply" and enters personal statement (max 2000 chars) and optional move-in date.
4. **System** calls TrustGate API to verify candidate's identity, income, and credit status.
5a. All verified: **System** creates candidacy record, captures verification snapshot, confirms receipt to candidate.
5b. Missing verifications: **System** rejects candidacy, displays list of outstanding verifications with links to complete them in TrustGate.
6. **System** notifies listing tenant of new candidacy.
7. **System** triggers ranking recalculation, locks criteria catalog if first candidacy.
8. **System** emits audit events.

## Exceptions

- **TrustGate unavailable:** System displays "verification service temporarily unavailable, please try again later" with HTTP 503.
- **Duplicate candidacy:** System displays "you have already applied for this listing".
- **Listing no longer published:** System displays "this listing is no longer accepting applications".