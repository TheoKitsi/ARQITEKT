---
type: Function
id: FN-1.4.1.2
title: "Update Candidate Ranking"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.4.1
---

# FN-1.4.1.2: Update Candidate Ranking

## Functional Description

- The system shall maintain an ordered list of candidates for each listing, ranked by composite qualification score descending.
- The system shall recalculate the ranking when a new candidacy is submitted or an existing candidacy is withdrawn.
- The system shall break ties by candidacy submission timestamp (earlier submission ranks higher).
- The system shall flag candidates whose score falls below a configurable minimum threshold (default: 30 percentile) with a "below threshold" marker.
- The system shall update the ranking cache in Redis for fast retrieval.
- The system shall emit a "ranking updated" event for the Decision Workflow.

## Preconditions

- At least one candidacy exists for the listing.
- Score calculation has completed for the affected candidate(s).

## Behavior

1. System receives candidacy event (submitted or withdrawn).
2. System recalculates score for new candidate (or removes withdrawn).
3. System sorts all candidates by score descending, then by timestamp ascending for ties.
4. System applies threshold check and flags below-threshold candidates.
5. System updates ranking in Redis.
6. System emits "ranking updated" event.

## Postconditions

- The ranking reflects all current candidacies.
- Redis cache is consistent with the database.
- Below-threshold candidates are flagged.

## Error Handling

- The system shall fall back to database query if Redis is unavailable, and queue a cache rebuild.
- The system shall log an error and alert ops if score calculation fails for any candidate, excluding that candidate from the ranking until resolved.