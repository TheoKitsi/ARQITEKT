---
type: Function
id: FN-1.3.1.2
title: "Apply Hard Filters"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.3.1
---

# FN-1.3.1.2: Apply Hard Filters

## Functional Description

- The system shall apply mandatory filters to the candidate pool: location radius, maximum budget, required TrustGate badges, and move-in timeline compatibility.
- The system shall compute geodistance between property and candidate preferred locations.
- The system shall exclude candidates whose budget maximum is below the listed rent.
- The system shall exclude candidates missing any required badge type.

## Preconditions

- Search criteria include location coordinates, rent amount, required badges, and move-in date.
- Pool profiles have geocoded preferred locations and badge snapshots.

## Behavior

1. Query active pool profiles from cache.
2. For each profile:
   a. Compute haversine distance to property; exclude if > search radius (default 10 km).
   b. Compare budget range to rent; exclude if max budget < rent.
   c. Verify required badge presence; exclude if any missing.
   d. Check timeline overlap; exclude if move-in windows don't overlap.
3. Return passing candidate IDs to scoring stage.

## Postconditions

- Filtered candidate set available for soft-score computation.
- Filter statistics logged (total screened, passed, excluded per reason).

## Error Handling

- The system shall treat missing geodata as filter failure and exclude the candidate.
- The system shall treat stale badge data (> 10 minutes) as a soft warning and proceed with cached data.