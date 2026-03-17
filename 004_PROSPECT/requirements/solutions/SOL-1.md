---
type: Solution
id: SOL-1
title: "Owner Tenant Search Platform"
status: draft
version: "1.0"
date: "2025-07-14"
owner: "kitsi"
parent: BC
---

# SOL-1: Owner Tenant Search Platform

## Solution Description

The Owner Tenant Search Platform enables property owners to find qualified, verified tenants through criteria-based matching. Landlords define search criteria (location, unit details, desired tenant profile), the system matches against TrustGate-verified candidates who have opted into the matching pool, generates a ranked shortlist, facilitates viewing scheduling, and tracks the lease decision to completion.

## System Boundaries

### Internal
- Search request management (creation, criteria, lifecycle)
- Candidate pool integration (opt-in management, profile sync)
- Matching engine (criteria evaluation, ranking)
- Shortlist assembly and delivery
- Viewing scheduler
- Lease decision tracker

### External
- **TrustGate** — Verified candidate data, badges, scores
- **Authentication Provider** — Keycloak/OIDC for owners and candidates
- **Notification Service** — Multi-channel delivery
- **Geocoding Service** — Address normalization and proximity calculation

## User Story Index

| ID | Title | Status |
|---|---|---|
| US-1.1 | Search Request Creation | draft |
| US-1.2 | Candidate Pool Integration | draft |
| US-1.3 | Criteria-Based Matching | draft |
| US-1.4 | Shortlist Delivery | draft |
| US-1.5 | Viewing Scheduling | draft |
| US-1.6 | Lease Decision Tracking | draft |

## Architecture Context

```
[Property Owner] --> (Prospect API) --> [Search Service]
                                         |-> [Matching Engine] --> [TrustGate API]
                                         |-> [Shortlist Service]
                                         |-> [Viewing Scheduler]
                                         |-> [Decision Tracker]
[Verified Candidate] --> (Prospect API) --> [Pool Service]
[Geocoding Service] <--> [Matching Engine]
[Notification Service] <-- (Events)
```

## Edge Cases

- **Zero matching candidates** — landlord notified; option to broaden criteria or wait for new candidates.
- **Candidate opts out of pool during active match** — removed from active shortlists; landlord notified.
- **Landlord never reviews shortlist** — reminders at 3, 7, 14 days; auto-expires after 30 days.
- **All shortlisted candidates decline viewing** — new matching round triggered.
- **Property manager manages for multiple owners** — strict data isolation per owner.