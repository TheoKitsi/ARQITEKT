---
type: Conversation
id: CONV-1
title: "Listing Creation Flow"
status: draft
version: "1.0"
date: "2025-07-14"
---

# CONV-1: Listing Creation Flow

## Context

Describes the end-to-end interaction when a listing tenant creates a new successor search listing, from initial draft through landlord approval to publication.

## Actors

- **Listing Tenant** — Initiates the listing
- **Landlord** — Approves or rejects the listing
- **System** — Orchestrates validation, notifications, state transitions

## Flow

1. **Tenant** opens "Create Listing" form and enters: unit address, description, preferred successor profile, candidacy deadline.
2. **System** creates listing in "draft" state, generates listing ID.
3. **Tenant** configures criteria catalog (activates/deactivates system criteria, adds custom criteria, adjusts weights).
4. **System** validates catalog (at least one active criterion, weights in range), normalizes weights.
5. **Tenant** selects landlord approval method: document upload or in-app request.
6a. **Upload path:** Tenant uploads approval document. System validates format/size, stores document, records approval.
6b. **In-app path:** System sends approval request to landlord. Landlord receives notification, reviews listing draft, approves or rejects.
7. **System** records approval decision and transitions listing approval status.
8. If approved: **Tenant** clicks "Publish". **System** validates all prerequisites (approved, catalog configured) and transitions to "published".
9. If rejected: **System** notifies tenant with rejection reason. Tenant may revise and re-request approval.
10. **System** emits audit events at each step.

## Exceptions

- **Landlord non-response:** System sends reminders at 3, 7, and 14 days. Auto-cancels at 30 days.
- **Document validation failure:** Tenant sees specific error (wrong format, too large) and can retry.
- **Approval revocation:** Landlord revokes before first candidacy; listing returns to draft.