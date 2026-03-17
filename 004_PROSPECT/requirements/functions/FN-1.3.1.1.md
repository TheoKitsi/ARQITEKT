---
type: Function
id: FN-1.3.1.1
title: "Execute Matching Run"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.3.1
---

# FN-1.3.1.1: Execute Matching Run

## Functional Description

- The system shall trigger a matching run upon receiving a `search.created` event.
- The system shall retrieve all active pool profiles passing hard filters (FN-1.3.1.2).
- The system shall compute a matching score (0-100) for each passing candidate using configurable weights for soft criteria: proximity, timeline alignment, budget fit, lifestyle match.
- The system shall rank candidates by score descending and forward the top N to the Shortlist Service.

## Preconditions

- Search record exists with status `created` and geocoded coordinates.
- At least one active pool profile exists.

## Behavior

1. Load search criteria and property coordinates.
2. Apply hard filters via FN-1.3.1.2; obtain candidate subset.
3. For each candidate, compute weighted score across soft dimensions.
4. Sort by score descending; select top N (default 10).
5. Update search status to `matching-complete`.
6. Dispatch ranked list to Shortlist Service.
7. Complete within 30-minute SLA.

## Postconditions

- Ranked candidate list forwarded to Shortlist Service.
- Search status updated to `matching-complete`.
- Matching run metadata persisted (duration, candidate counts, score distribution).

## Error Handling

- The system shall return an empty shortlist and set search status to `no-candidates` when no profiles pass hard filters.
- The system shall log a platform alert if matching exceeds 30-minute SLA.
- The system shall retry on transient database errors up to 3 times.