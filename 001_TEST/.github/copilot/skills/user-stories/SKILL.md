---
name: User Stories Skill
description: Knowledge for creating and evaluating user stories. Used by @architect and @review.
---

# User Stories — Skill Reference

## Purpose

A User Story (US) describes a **user requirement** from the user's perspective. It bridges business view (SOL) and technical implementation (CMP/FN).

## Template

-> `requirements/templates/user-story.md`

## Format (strict)

```markdown
As a {role}
I want to {capability/action}
So that {benefit/business value}.
```

### Role Examples

| Role | Meaning |
|---|---|
| new user | Not yet registered/verified |
| verified user | Has completed verification |
| premium user | Paying subscriber |
| platform operator | System operator / admin |
| support agent | Customer service |

## Acceptance Criteria — Rules

Each AC must:
1. **Be testable** — a tester can clearly say yes/no
2. **Be independent** — no AC depends on another
3. **Be specific** — name numbers, timeframes, states where relevant
4. **Format**: `AC-{sol}.{us}.{n}: {Testable statement}`

### Good Examples

- AC-1.1.1: The user can enter a mobile number and receives an SMS code for confirmation within 60 seconds.
- AC-3.1.4: A deal-breaker in either profile leads to immediate exclusion — no match.

### Bad Examples

- AC-x.y.z: The system works well. — Not testable
- AC-x.y.z: The user is satisfied. — Subjective
- AC-x.y.z: Performance is good. — No numbers

## Quality Criteria

- [ ] **User story format** correct (As a / I want to / So that)
- [ ] **6-10 acceptance criteria** (fewer = too vague, more = too large -> split)
- [ ] **Role defined** — not "user" but which user
- [ ] **Benefit clear** — "so that" is not trivial
- [ ] **Independent** — can be implemented and tested alone
- [ ] **Vertical** — cuts through all layers (UI -> Logic -> Data)
- [ ] **CMP references** — at least 1 component assigned
- [ ] **Notification references** — if notifications are triggered

## INVEST Criteria

| Criterion | Meaning | Check |
|---|---|---|
| **I**ndependent | Independent of other US | Can be released alone? |
| **N**egotiable | Negotiable, not a contract | Room for implementation? |
| **V**aluable | Valuable for user/business | Why should it be built? |
| **E**stimable | Estimable | Can effort be estimated? |
| **S**mall | Small enough for 1 sprint | Doable in 1-2 weeks? |
| **T**estable | Testable via AC | Can you say yes/no? |

## From US to CMPs

1. Read the US + all ACs
2. Identify technical modules needed
3. Each module = one CMP
4. Typical: 1-3 CMPs per US
5. A CMP can be UI, backend logic, or data component

## Anti-Patterns

- Technical US: "As a developer I want a database" — no user value
- Epic as US: US with 15+ ACs — split it
- No benefit: "so that it works" — why?
- Missing role: "One wants to" — who exactly?
