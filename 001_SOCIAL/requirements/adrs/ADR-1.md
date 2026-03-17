---
type: ADR
id: ADR-1
title: "5-Level Funnel Architecture"
status: draft
version: "1.0"
date: "2025-07-14"
---

# ADR-1: 5-Level Funnel Architecture

## Status
Accepted.

## Context
SOCIAL guides users through a structured 5-level funnel, progressing from foundational
values (Level 1) toward personal details and visual profile (Level 5). The matching
algorithm weighs deeper levels more heavily, incentivizing thoughtful profile completion.
The architecture must support progressive disclosure — users reveal more about themselves
as they advance — while keeping the system extensible for future funnel adjustments.

## Decision
The system shall implement the funnel as a modular, level-based architecture where each
funnel level is an independent data unit stored as a JSONB column per level in the
`funnel_profiles` table. Levels are unlocked sequentially; a user must complete Level N
before accessing Level N+1. The matching algorithm receives a composite profile object
and applies level-specific weights. The staged profile release (SOL-16) ties visibility
directly to the funnel level — matched partners see only the levels the user has completed.

Key design choices:
- Each level has its own schema version for independent evolution.
- Funnel structure is configuration-driven (YAML), not hard-coded.
- Matching weights per level are tunable without redeployment.

## Consequences

### Positive
- Levels can be reordered, added, or split without schema migrations.
- Progressive disclosure creates natural engagement incentive.
- Matching weights are adjustable per A/B test cohort.
- Clear separation between profile data and visibility rules.

### Negative
- JSONB storage trades query ergonomics for schema flexibility.
- Sequential unlock may frustrate users who want to complete all levels at once.
- Level-specific validation logic must be maintained for each schema version.

### Risks
- Funnel redesign (e.g., merging levels) requires data migration tooling.
- Weight tuning without feedback data (SOL-15) in early phase may produce suboptimal matches.
