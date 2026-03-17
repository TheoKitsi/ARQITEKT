---
name: Solutions Skill
description: Knowledge for creating and evaluating solution requirements. Used by @architect and @review.
---

# Solutions — Skill Reference

## Purpose

A Solution (SOL) is a **feature area** — a bounded solution building block that implements one aspect of the business case. It contains the overview, edge cases, and references to its user stories.

## Template

-> `requirements/templates/solution.md`

## What Belongs in a SOL?

1. **Header**: ID, title, BC reference, version, date, dependencies
2. **Solution Description**: Metrics (US/CMP/FN count) + 1-2 paragraphs description
3. **System Boundaries**: What is in, what is out
4. **User Story Index**: Table with links to US files
5. **Architecture Context** (optional): ASCII/Mermaid diagram for complex cases
6. **Edge Cases**: Table with scenario + resolution

## Quality Criteria

- [ ] **Clearly bounded** — One SOL addresses ONE aspect, not everything
- [ ] **1-5 User Stories** — Less than 1 = no SOL needed. More than 5 = split.
- [ ] **Dependencies documented** — Upstream (<- what depends on) and Downstream (-> who depends on me)
- [ ] **Edge Cases** — At least 2-3 per SOL
- [ ] **No implementation details** — SOL describes WHAT, not HOW

## SOL Decomposition Heuristics

| Criterion | -> Own SOL |
|---|---|
| Independently developable | yes |
| Own user perspective | yes |
| Own data/entities | yes |
| Can be disabled without breaking everything | yes |
| Only one aspect of a larger feature | no (belongs in existing SOL) |

## Edge Case Design

Good edge cases answer:
1. **What happens when it fails?** (Error case)
2. **What happens at the boundary?** (Boundary values)
3. **What happens with abuse?** (Malicious user)
4. **What happens with concurrency?** (Race conditions)
5. **What happens when empty?** (No data, first user)

## Anti-Patterns

- God-SOL: Everything in one SOL — split it
- Micro-SOL: SOL with only 1 FN — better integrate into existing SOL
- No edge cases: Every SOL has edge cases — if none are documented, not enough thought was given
- Implementation in SOL: "We use PostgreSQL" — belongs in ADR
- Circular dependencies: SOL-A <-> SOL-B — break or merge