---
type: UserStory
id: US-1.8
title: "Audit Trail"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.8.1
---

# US-1.8: Audit Trail

**As a** platform operator
**I want to** access a complete, immutable audit trail for every listing and candidacy
**So that** I can investigate disputes, demonstrate regulatory compliance, and maintain platform trust

## Acceptance Criteria

- **AC-1.8.1:** The system shall log every state transition of a listing (draft, approved, published, decision-pending, completed, cancelled) with timestamp, actor, and triggering action.
- **AC-1.8.2:** The system shall log every candidacy event (submitted, withdrawn, accepted, rejected, promoted) with timestamp, actor, and metadata.
- **AC-1.8.3:** The system shall log landlord approval events (requested, granted, revoked) with method and document reference.
- **AC-1.8.4:** The system shall store audit entries in an append-only data store; no entry may be modified or deleted.
- **AC-1.8.5:** The system shall provide a search interface for platform operators to query audit entries by listing ID, user ID, event type, or date range.
- **AC-1.8.6:** The system shall support export of audit entries in JSON and CSV formats for regulatory reporting.
- **AC-1.8.7:** The system shall retain audit data for a minimum of 10 years in compliance with German commercial record-keeping requirements.
- **AC-1.8.8:** The system shall include a hash chain (each entry references the hash of the previous entry) to detect tampering.