---
type: Component
id: CMP-1.6.1
title: "Score Engine"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.6
functions:
  - FN-1.6.1.1
  - FN-1.6.1.2
---

# CMP-1.6.1: Score Engine

## Responsibility

The Score Engine is responsible for computing composite scores from individual badge results. The system shall apply configurable weights per check module, support hard exclusion rules (critical negatives disqualify regardless of other scores), version the scoring algorithm, ensure historical reproducibility by storing inputs and algorithm version, and recalculate scores when badges are updated. The system shall expose scores as percentiles with transparent breakdowns.

## Interfaces

- **Inbound:** Badge Service (badge updates), Order Service (score request), Re-Check Service (badge refresh)
- **Outbound:** Result API (score delivery), Audit Service (calculation logs)

## Functions

| ID | Title |
|---|---|
| FN-1.6.1.1 | Calculate Composite Score |
| FN-1.6.1.2 | Apply Exclusion Rules |

## Constraints

- Scoring algorithm is versioned; existing scores remain valid under their original version.
- All calculation inputs persisted for reproducibility.
- Hard exclusion overrides composite score (score set to 0 with "disqualified" flag).
- Scores range 0-100 percentile.

## Infrastructure References

- INF-1 (PostgreSQL — score records, algorithm versions)