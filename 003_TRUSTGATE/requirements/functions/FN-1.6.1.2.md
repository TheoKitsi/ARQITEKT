---
type: Function
id: FN-1.6.1.2
title: "Apply Exclusion Rules"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.6.1
---

# FN-1.6.1.2: Apply Exclusion Rules

## Functional Description

- The system shall evaluate a configurable set of exclusion rules against the subject's badges before composite score calculation.
- The system shall support hard exclusion rules: if identity badge is "failed", if credit badge is "negative" — these result in immediate disqualification.
- The system shall set the composite score to 0 and add a "disqualified" flag with the triggering rule name.
- The system shall allow B2B clients to configure custom exclusion rules for their tenant scope.
- The system shall log all exclusion evaluations in the audit trail.

## Preconditions

- Badges have been generated for the subject.

## Behavior

1. System retrieves exclusion rule set (system defaults + client custom rules).
2. System evaluates each rule against current badges.
3. If any rule triggers: return disqualification with rule name.
4. If no rule triggers: proceed to composite calculation.

## Postconditions

- Either disqualification recorded, or subject cleared for scoring.

## Error Handling

- The system shall default to system rules if client custom rules cannot be loaded.
- The system shall log rule evaluation failures without blocking the scoring pipeline.