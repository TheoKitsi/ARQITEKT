---
type: Component
id: CMP-1.3.1
title: "Matching Engine"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.3
functions:
  - FN-1.3.1.1
  - FN-1.3.1.2
---

# CMP-1.3.1: Matching Engine

## Responsibility

The Matching Engine is responsible for evaluating pool candidates against search criteria and producing ranked results. The system shall apply hard filters (location, budget, required badges) first, then compute matching scores with configurable weights for soft criteria (proximity, timeline, preferences). The system shall complete initial matching within 30 minutes, prevent double-matching to the same owner, and output ranked candidate lists.

## Interfaces

- **Inbound:** Search Service (trigger), Pool Service (candidate data)
- **Outbound:** Shortlist Service (ranked results), TrustGate API (badge verification), Geocoding Service (distance calculation), Audit Service

## Functions

| ID | Title |
|---|---|
| FN-1.3.1.1 | Execute Matching Run |
| FN-1.3.1.2 | Apply Hard Filters |

## Constraints

- Hard filters are mandatory (no candidate passes without meeting all).
- Matching score range: 0-100.
- Initial run SLA: < 30 minutes.
- No double-matching to same owner.

## Infrastructure References

- INF-1 (PostgreSQL — matching results)
- INF-2 (Redis — matching cache)
- INF-4 (Geocoding — distance calculation)