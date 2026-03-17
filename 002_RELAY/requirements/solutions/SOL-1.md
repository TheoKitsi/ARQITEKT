---
type: Solution
id: SOL-1
title: "Successor Search Platform"
status: draft
version: "1.0"
date: "2025-07-14"
owner: "kitsi"
parent: BC
---

# SOL-1: Successor Search Platform

## Solution Description

The Successor Search Platform is the core solution within Relay. It provides a structured, end-to-end workflow for listing a rental unit for successor search, collecting verified candidacies, ranking candidates against published criteria, and facilitating the landlord's decision — all with full auditability.

The solution covers the complete lifecycle from listing creation (requiring landlord approval) through candidacy collection, qualification-based ranking, landlord decision with runner-up fallback, to handover completion or exceptional cancellation.

## System Boundaries

### Internal
- Listing management (creation, approval, publication, closure)
- Criteria catalog engine (system + custom criteria)
- Candidacy intake (with verification gate)
- Ranking and scoring engine
- Decision workflow (landlord choice, runner-up promotion)
- Cancellation workflow with reason documentation
- Badge rendering for candidate comparison
- Audit trail logging

### External
- **TrustGate** — Verification status lookup (eID, income, credit)
- **Authentication Provider** — User identity and session management (Keycloak/OIDC)
- **Notification Service** — Email, push, and in-app notification delivery
- **Document Storage** — Landlord approval documents, cancellation evidence

## User Story Index

| ID | Title | Status |
|---|---|---|
| US-1.1 | Landlord Approval Before Listing | draft |
| US-1.2 | Criteria Catalog | draft |
| US-1.3 | Verified Candidacy | draft |
| US-1.4 | Qualification-Based Ranking | draft |
| US-1.5 | Landlord Decision and Runner-Up | draft |
| US-1.6 | Exceptional Cancellation | draft |
| US-1.7 | Badge-Based Candidate View | draft |
| US-1.8 | Audit Trail | draft |

## Architecture Context

```
[Listing Tenant] --> (Relay API) --> [Listing Service]
                                      |-> [Criteria Engine]
                                      |-> [Candidacy Service] --> [TrustGate API]
                                      |-> [Ranking Engine]
                                      |-> [Decision Workflow]
                                      |-> [Audit Service]
[Landlord] --> (Relay API) --> [Decision Workflow]
[Candidate] --> (Relay API) --> [Candidacy Service]
[Auth Provider] <--> (Relay API)
[Notification Service] <-- (Events)
```

## Edge Cases

- **No candidates apply** — listing expires; tenant notified; option to extend or relist.
- **Landlord never approves** — listing stays in draft; system sends reminders; auto-cancel after 30 days.
- **All candidates fail verification** — listing stays open; zero qualified candidates shown; tenant notified.
- **Landlord rejects all candidates** — runner-up chain exhausted; tenant can extend candidacy period or cancel.
- **Candidate withdraws during decision** — next runner-up promoted automatically.
- **Duplicate listings for same unit** — system detects by address/unit and blocks duplicates.
- **TrustGate unavailable** — candidacy blocked with retry guidance; no unverified candidates admitted.