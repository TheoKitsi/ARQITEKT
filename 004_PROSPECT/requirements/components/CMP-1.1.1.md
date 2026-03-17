---
type: Component
id: CMP-1.1.1
title: "Search Service"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.1
functions:
  - FN-1.1.1.1
---

# CMP-1.1.1: Search Service

## Responsibility

The Search Service is responsible for managing tenant search request lifecycle. The system shall accept search creation with property details and tenant criteria, normalize addresses via geocoding, validate required fields, generate unique search reference IDs, support property manager delegation, and trigger the matching engine upon creation. The system shall track searches through their lifecycle: created, matching, shortlist-delivered, viewings-scheduled, completed, closed-unfilled, expired.

## Interfaces

- **Inbound:** Owner UI / Property Manager UI (search CRUD), Matching Engine (status updates)
- **Outbound:** Geocoding Service (address normalization), Matching Engine (trigger), Notification Service (lifecycle events), Audit Service

## Functions

| ID | Title |
|---|---|
| FN-1.1.1.1 | Create Search Request |

## Constraints

- Property address must be geocoded successfully before matching.
- Property manager access requires explicit delegation from owner.
- Search requests expire after 30 days without completion.

## Infrastructure References

- INF-1 (PostgreSQL — search records)
- INF-4 (Geocoding integration)