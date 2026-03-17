---
type: Function
id: FN-1.1.1.1
title: "Create Search Request"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.1.1
---

# FN-1.1.1.1: Create Search Request

## Functional Description

- The system shall accept property address, type, size, availability date, monthly rent, and tenant criteria from the owner or delegated property manager.
- The system shall geocode the property address via INF-4 and store the normalized coordinates.
- The system shall generate a unique search reference ID (format: `SR-{YYYYMMDD}-{seq}`).
- The system shall validate that all required fields are present and the owner has an active subscription.
- The system shall create the search record with status `created` and trigger the Matching Engine.

## Preconditions

- Owner is authenticated and has an active Prospect subscription.
- Property address is within a supported service region.

## Behavior

1. Validate required fields; reject with `400 Bad Request` if incomplete.
2. Call Geocoding Service; if geocoding fails, return `422 Unprocessable Entity`.
3. Insert search record into PostgreSQL with status `created`.
4. Dispatch async event `search.created` to Matching Engine.
5. Return search reference ID and estimated matching time.

## Postconditions

- Search record persisted with geocoded coordinates.
- Matching Engine triggered asynchronously.
- Audit log entry written.

## Error Handling

- The system shall return `400 Bad Request` when required fields are missing.
- The system shall return `422 Unprocessable Entity` when geocoding fails or address is outside service region.
- The system shall return `403 Forbidden` when the user lacks an active subscription.
- The system shall return `409 Conflict` when a duplicate active search exists for the same property.
- The system shall return `503 Service Unavailable` when the Geocoding Service is unreachable, and queue the request for retry.