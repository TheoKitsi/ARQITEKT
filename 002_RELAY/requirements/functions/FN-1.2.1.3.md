---
type: Function
id: FN-1.2.1.3
title: "Normalize Criteria Weights"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.2.1
---

# FN-1.2.1.3: Normalize Criteria Weights

## Functional Description

- The system shall compute the sum of all active criteria weights and normalize each weight so the total equals 1.0.
- The system shall recalculate normalization whenever criteria are activated, deactivated, or weight values change.
- The system shall store both the raw weight and the normalized weight for each criterion.
- The system shall use the normalized weights for all ranking calculations.

## Preconditions

- At least one criterion is active.
- The catalog is not locked.

## Behavior

1. Tenant modifies criteria (add, remove, reweight).
2. System sums all active raw weights.
3. System divides each raw weight by the total to produce normalized weights summing to 1.0.
4. System persists normalized weights alongside raw weights.

## Postconditions

- All active criteria have a normalized weight.
- Normalized weights sum to 1.0 (+/- floating point tolerance of 0.001).

## Error Handling

- The system shall return HTTP 400 if the total raw weight is zero (no active criteria).
- The system shall handle floating point precision by rounding to 6 decimal places.