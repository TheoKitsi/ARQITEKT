---
name: ADR Skill
description: Knowledge for creating and evaluating Architecture Decision Records. Used by @architect and @review.
---

# Architecture Decision Records — Skill Reference

## Purpose

An ADR documents a **significant architectural decision** — the context, the decision, the reasoning, and the consequences. ADRs are immutable records; if a decision changes, a new ADR supersedes the old one.

## Template

-> `requirements/templates/adr.md`

## Mandatory Sections

### 1. Context (required)

What situation or problem prompted this decision? What forces are at play?

### 2. Decision (required)

What was decided? Clear, imperative statement.

### 3. Reasoning (required)

Why was this option chosen? What trade-offs were accepted?

### 4. Alternatives Considered (required)

What other options were evaluated? Why were they rejected?

### 5. Consequences (required)

What are the positive AND negative effects of this decision?

### 6. Affected Requirements (optional)

Which SOLs, CMPs, or INFs does this ADR affect?

### 7. References (optional)

Links to external resources, RFCs, papers, etc.

## Quality Criteria

- [ ] **Context explains WHY** — Not just "we needed to decide" but the forces
- [ ] **Decision is clear** — One sentence, imperative
- [ ] **At least 2 alternatives** — If no alternatives were considered, was it really a decision?
- [ ] **Consequences include negatives** — Every decision has trade-offs
- [ ] **Immutable** — ADRs are not edited; superseded by new ADRs

## When to Write an ADR

| Situation | ADR? |
|---|---|
| Technology choice (DB, framework, language) | yes |
| Architecture pattern (microservices vs. monolith) | yes |
| Security decision (auth strategy, encryption) | yes |
| Business rule implementation approach | sometimes |
| Code style / formatting | no (use linter config) |
| Bug fix approach | no (use commit message) |

## ADR Lifecycle

1. **proposed** — Decision drafted, not yet agreed
2. **accepted** — Team agrees, decision is binding
3. **deprecated** — No longer recommended but still in effect
4. **superseded** — Replaced by newer ADR (link to successor)

## Anti-Patterns

- Retroactive ADR: Decision was made months ago, documentation is afterthought — write ADRs before or during decision
- No alternatives: "We chose React" without explaining why not Vue/Angular — always document alternatives
- No consequences: "We use microservices" without acknowledging complexity cost — every decision has trade-offs
- Mutable ADR: Editing old ADRs to match current state — write new ADR that supersedes
