---
type: Component
id: CMP-1.2.1
title: "Criteria Engine"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.2
functions:
  - FN-1.2.1.1
  - FN-1.2.1.2
  - FN-1.2.1.3
---

# CMP-1.2.1: Criteria Engine

## Responsibility

The Criteria Engine is responsible for managing the criteria catalog associated with each listing. The system shall provide a default set of system criteria (income ratio, credit record, identity verification, employment status) that tenants can activate or deactivate. The system shall allow tenants to add up to 5 custom criteria with configurable data types and weight overrides. The system shall normalize all weights to sum to 1.0, enforce that at least one criterion is active before publication, and lock the catalog once the first candidacy arrives. The system shall expose the complete criteria catalog on the public listing page for candidate self-assessment.

## Interfaces

- **Inbound:** Listing Management UI (criterion CRUD), Ranking Engine (criteria + weights query)
- **Outbound:** Listing Publication Service (catalog snapshot for display), Audit Service (catalog changes)

## Functions

| ID | Title |
|---|---|
| FN-1.2.1.1 | Configure Criteria Catalog |
| FN-1.2.1.2 | Lock Criteria Catalog |
| FN-1.2.1.3 | Normalize Criteria Weights |

## Constraints

- Maximum 5 custom criteria per listing.
- Weight adjustment range: 0.5x to 2.0x of default weight.
- Catalog becomes immutable after first candidacy received.
- System criteria cannot be deleted, only deactivated.

## Infrastructure References

- INF-1 (PostgreSQL — criteria definitions and weights)