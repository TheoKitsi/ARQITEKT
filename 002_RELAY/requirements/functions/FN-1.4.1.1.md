---
type: Function
id: FN-1.4.1.1
title: "Calculate Qualification Score"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.4.1
---

# FN-1.4.1.1: Calculate Qualification Score

## Functional Description

- The system shall evaluate each active criterion against the candidate's verification snapshot and candidacy data.
- The system shall compute a per-criterion score (0.0 to 1.0) based on the criterion type: boolean criteria yield 1.0 (met) or 0.0 (not met); numeric criteria yield a proportional score within a defined range; text criteria yield 1.0 if provided and 0.0 if empty.
- The system shall multiply each per-criterion score by its normalized weight and sum the results to produce a composite score (0.0 to 1.0).
- The system shall convert the composite score to a percentile (0-100) for display.
- The system shall log the full calculation (input values, per-criterion scores, weights, composite) for audit.

## Preconditions

- The criteria catalog is locked (at least one candidacy exists).
- Normalized weights are available.
- The candidate's verification snapshot is available.

## Behavior

1. For each active criterion, system retrieves the candidate's relevant data.
2. System applies the scoring function per criterion type.
3. System multiplies per-criterion score by normalized weight.
4. System sums weighted scores to composite.
5. System converts to percentile.
6. System logs full calculation to audit.
7. System returns score object.

## Postconditions

- A qualification score (0-100 percentile) exists for the candidate.
- A detailed score breakdown is stored for display and audit.

## Error Handling

- The system shall assign a score of 0.0 for any criterion where the candidate data is missing, and flag the criterion as "data unavailable" in the breakdown.
- The system shall log a warning if the composite score rounds to exactly 0 or 100 (edge cases).
- The system shall return HTTP 500 if the criteria catalog cannot be loaded, with a retry mechanism.