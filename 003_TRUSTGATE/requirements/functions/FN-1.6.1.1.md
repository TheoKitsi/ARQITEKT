---
type: Function
id: FN-1.6.1.1
title: "Calculate Composite Score"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.6.1
---

# FN-1.6.1.1: Calculate Composite Score

## Functional Description

- The system shall retrieve all current badges for the subject (identity, income, credit).
- The system shall apply configurable weights per badge type (defaults: identity 0.3, income 0.4, credit 0.3).
- The system shall map badge statuses to numeric values: verified/positive = 1.0, partially = 0.5, pending = 0.0, failed/negative = 0.0, expired = 0.0.
- The system shall compute the weighted sum and convert to percentile (0-100).
- The system shall store the calculation record with all inputs, weights, algorithm version, and result for reproducibility.
- The system shall emit an audit event for each calculation.

## Preconditions

- At least one badge exists for the subject.

## Behavior

1. System retrieves current badges.
2. System checks for exclusion rules (hard negatives).
3. If excluded: set score to 0, flag "disqualified", return.
4. System maps badges to numeric values.
5. System applies weights and computes percentile.
6. System stores calculation record.

## Postconditions

- Composite score (0-100) available for the subject.
- Calculation fully reproducible from stored record.

## Error Handling

- The system shall assign 0 for any missing badge type and note "not available" in the breakdown.
- The system shall log a warning if all badges are missing (score = 0).