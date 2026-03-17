---
type: Solution
id: SOL-1
title: "Verification Pipeline"
status: draft
version: "1.0"
date: "2025-07-14"
owner: "kitsi"
parent: BC
---

# SOL-1: Verification Pipeline

## Solution Description

The Verification Pipeline is TrustGate's core solution. It orchestrates the complete verification lifecycle: accepting verification orders with configurable check modules, executing identity verification (eID/NFC or alternative), income verification, and credit checks, calculating badges and composite scores, managing consent and data release, providing API access for B2B clients, automating re-checks on expiration, and enforcing data subject rights.

## System Boundaries

### Internal
- Order management (creation, configuration, status tracking)
- Identity verification engine (eID/NFC flow, alternative methods)
- Income verification engine (document upload, plausibility checks)
- Credit check orchestrator (third-party provider integration)
- Badge and score calculation engine
- Consent management service
- API gateway for B2B result retrieval
- Re-check scheduler and expiration manager
- Data subject rights processor

### External
- **eID Provider** — German eID/NFC verification service (AusweisApp2 SDK)
- **Video-Ident Provider** — Alternative identity verification service
- **SCHUFA / Creditreform** — Credit bureau APIs
- **Relay** — Internal consumer of verification results
- **Prospect** — Internal consumer of verification results
- **Notification Service** — Email, push, in-app delivery
- **Authentication Provider** — Keycloak/OIDC for user and B2B client auth

## User Story Index

| ID | Title | Status |
|---|---|---|
| US-1.1 | Verification Order Management | draft |
| US-1.2 | eID NFC Identification | draft |
| US-1.3 | Alternative Identification | draft |
| US-1.4 | Income Verification | draft |
| US-1.5 | Credit Check Integration | draft |
| US-1.6 | Badge and Score Calculation | draft |
| US-1.7 | Consent and Data Release | draft |
| US-1.8 | API Result Retrieval | draft |
| US-1.9 | Re-Check and Expiration Management | draft |
| US-1.10 | Data Subject Rights | draft |

## Architecture Context

```
[End User] --> (TrustGate API) --> [Order Service]
                                    |-> [Identity Engine] --> [eID Provider]
                                    |                     --> [Video-Ident Provider]
                                    |-> [Income Engine]
                                    |-> [Credit Orchestrator] --> [SCHUFA API]
                                    |-> [Score Engine]
                                    |-> [Consent Service]
[B2B Client] --> (TrustGate API) --> [Result API]
[Relay / Prospect] --> (TrustGate API) --> [Result API]
[Auth Provider] <--> (TrustGate API)
[Notification Service] <-- (Events)
```

## Edge Cases

- **eID hardware not available** — user redirected to alternative identification.
- **Credit provider timeout** — order stays in "pending-credit" with retry; badge shows "pending".
- **Consent revoked mid-verification** — affected check modules cancelled; partial results purged.
- **Income document unreadable** — manual review queue for operator; user notified of delay.
- **B2B client exceeds rate limit** — HTTP 429 with retry-after header.
- **Data deletion request for active verification** — verification cancelled first, then deletion processed.
- **Multiple concurrent orders for same user** — deduplicated by user ID and check module type.