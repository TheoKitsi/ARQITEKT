---
name: ARQITEKT Metamodel
description: Central knowledge document for the requirement hierarchy, naming conventions, relationship types, and validation rules. Referenced by all agents.
---

# ARQITEKT Metamodel — Skill Reference

## Purpose

This skill document is the **Single Source of Truth** for all agents. Read this document ALWAYS before creating, modifying, or validating requirements.

The technical configuration is in `config/metamodel.yaml` — this skill document explains the **semantics and application rules** behind it.

## Hierarchy Logic

### Core Tree (Top-Down)

```
BC-1 (Business Case)             <- ONE per project
+-- SOL-1 (Solution)              <- Feature area / solution building block
|   +-- US-1.1 (User Story)      <- User perspective, testable
|   |   +-- CMP-1.1.1 (Component)    <- Technical unit
|   |   |   +-- FN-1.1.1.1 (Function)    <- Single system behavior
|   |   |   |   +-- CONV-1.1.1.1.1 (Conversation) <- Chatbot dialog [optional]
|   |   |   +-- FN-1.1.1.2
|   |   +-- CMP-1.1.2
|   +-- US-1.2
+-- SOL-2
```

### Cross-Cutting (not in the hierarchy)

- **INF** (Infrastructure): WCAG, OWASP, DSGVO, i18n, State, Performance, CI/CD — apply to all
- **ADR** (Architecture Decision Record): Reasoned technical decisions
- **NTF** (Notification): Channel definitions (Push, Email, SMS, In-App) — referenced by FNs

## Naming Conventions

### ID Schema

| Type | Pattern | Example |
|---|---|---|
| Business Case | `BC-{n}` | BC-1 |
| Solution | `SOL-{n}` | SOL-3 |
| User Story | `US-{sol}.{n}` | US-3.1, US-3.2 |
| Component | `CMP-{sol}.{us}.{n}` | CMP-3.1.1, CMP-3.1.2 |
| Function | `FN-{sol}.{us}.{cmp}.{n}` | FN-3.1.1.1 |
| Conversation | `CONV-{sol}.{us}.{cmp}.{fn}.{n}` | CONV-3.1.1.1.1 |
| Infrastructure | `INF-{n}` | INF-1 |
| ADR | `ADR-{n}` | ADR-1 |
| Notification | `NTF-{n}` | NTF-1 |

### Filenames

| Type | Pattern | Example |
|---|---|---|
| Solution | `SOL-{n}_{Title}.md` | SOL-3_Matching.md |
| User Story | `US-{sol}.{n}_{Title}.md` | US-3.1_Score_Calculation.md |
| Component | `CMP-{sol}.{us}.{n}_{Title}.md` | CMP-3.1.1_Matching_Engine.md |
| Function | `FN-{sol}.{us}.{cmp}.{n}_{Title}.md` | FN-3.1.1.1_Bidirectional_Matching.md |

**Title rules**:
- English, spaces replaced by underscores
- Short and descriptive (3-5 words max)

### Acceptance Criteria and Edge Cases

| Type | Pattern | Example |
|---|---|---|
| Acceptance Criteria | `AC-{sol}.{us}.{n}` | AC-3.1.1, AC-3.1.2 |
| Edge Case | `EC-{sol}.{n}` | EC-3.1, EC-3.2 |

## Relationship Types

| Relationship | Meaning | Example |
|---|---|---|
| `refines` | Child refines parent | US-3.1 refines SOL-3 |
| `depends_on` | Requires prerequisite | SOL-3 depends_on SOL-2 |
| `constrains` | Cross-cutting constraint | INF-1 constrains CMP-3.1.1 |
| `triggers` | Triggers notification | FN-1.1.1.4 triggers NTF-1 |

### Dependency Notation in SOL Files

```markdown
> **Dependencies**: <- SOL-2 (upstream: provides profile data), -> SOL-9 (downstream: uses matching result)
```

## Status Workflow

```
idea -> draft -> review -> approved -> implemented
```

**Rules**:
- New requirements always start as `draft` (or `idea` if incomplete)
- `review` = actively reviewed by @review agent or stakeholder
- `approved` = accepted, ready for implementation
- `implemented` = code exists and is verified
- **Child status <= Parent status**: If SOL-3 is `draft`, US-3.1 cannot be `approved`

## Validation Rules (for @review agent and validate.mjs)

1. **V-001**: Every SOL needs >= 1 US
2. **V-002**: Every US needs >= 1 CMP
3. **V-003**: Every CMP needs >= 1 FN
4. **V-004**: Every US needs acceptance criteria (AC-*)
5. **V-005**: Child status <= Parent status
6. **V-006**: Mandatory frontmatter fields: type, id, title, status
7. **V-007**: No orphaned references
8. **V-008**: Every NTF needs >= 1 channel

## When to Use Which Type?

| Question | -> Type |
|---|---|
| "What is the big business idea?" | BC |
| "Which feature area addresses this?" | SOL |
| "What does the user concretely want to do?" | US |
| "Which technical module implements this?" | CMP |
| "What exactly does the system do?" | FN |
| "How does the bot talk to the user?" | CONV |
| "Through which channel is notification sent?" | NTF |
| "What standards always apply?" | INF |
| "Why did we decide this way?" | ADR |

## Anti-Patterns

- No requirement without a parent: Every FN must be reachable via CMP->US->SOL->BC
- God-SOL: A SOL with 10+ US is too large — split it
- Empty CMP: A component without functions is pointless
- Vague acceptance criteria: "System works well" — not testable
- Cyclic dependencies: SOL-A depends_on SOL-B depends_on SOL-A
- Status inconsistency: Child `approved`, parent `draft`
- Missing INF references: CMP with user data without DSGVO reference