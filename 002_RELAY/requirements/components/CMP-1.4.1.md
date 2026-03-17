---
type: Component
id: CMP-1.4.1
title: "Ranking Engine"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.4
functions:
  - FN-1.4.1.1
  - FN-1.4.1.2
---

# CMP-1.4.1: Ranking Engine

## Responsibility

The Ranking Engine is responsible for computing and maintaining the qualification-based ranking of candidates for each listing. The system shall evaluate each candidate's verification data and candidacy inputs against the listing's criteria catalog with normalized weights to produce a composite score. The system shall update the ranking in real time as candidacies arrive or withdraw, break ties by submission timestamp, display score breakdowns to the listing tenant without revealing raw personal data, and flag candidates below a configurable minimum threshold. The system shall not expose the ranking to candidates. The system shall log every score calculation for audit purposes.

## Interfaces

- **Inbound:** Candidacy Service (new/withdrawn candidacy events), Criteria Engine (criteria and weights)
- **Outbound:** Listing Tenant UI (ranked candidate list), Audit Service (score calculation logs), Decision Workflow (ranked shortlist)

## Functions

| ID | Title |
|---|---|
| FN-1.4.1.1 | Calculate Qualification Score |
| FN-1.4.1.2 | Update Candidate Ranking |

## Constraints

- Scores normalized to 0–100 percentile.
- Tie-breaking by candidacy submission timestamp (FIFO).
- Below-threshold candidates flagged but not removed.
- Raw personal data never included in ranking output.

## Infrastructure References

- INF-1 (PostgreSQL — score history)
- INF-2 (Redis — real-time ranking cache)