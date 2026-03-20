# ARQITEKT — Global Copilot Instructions

You are working in an **ARQITEKT Requirements-Engineering Workspace**. This framework generates and manages software requirements in a strict hierarchy:

```
BC (Business Case)
└── SOL (Solution)
    └── US (User Story)
        └── CMP (Component)
            └── FN (Function)
                └── CONV (Conversation Flow)  [optional]

Cross-Cutting: INF (Infrastructure), ADR (Architecture Decision), NTF (Notification)
```

## Core Rules

1. **Always read `config/metamodel.yaml` before creating or modifying requirements.** It defines the allowed hierarchy, naming conventions, and validation rules.

2. **Naming schema** (strict):
   - `SOL-{n}` -> `US-{sol}.{n}` -> `CMP-{sol}.{us}.{n}` -> `FN-{sol}.{us}.{cmp}.{n}`
   - Cross-Cutting: `INF-{n}`, `ADR-{n}`, `NTF-{n}`, `CONV-{sol}.{us}.{cmp}.{fn}.{n}`

3. **Every requirement file** has YAML frontmatter with: `type`, `id`, `title`, `status`, `parent` (except BC and cross-cutting entities).

4. **Language**: English for all requirement content. User stories in the format: "As a {role} I want to {action} So that {benefit}"

5. **Functional requirements**: Always use "The system shall {behavior}" format. Each shall-statement must be specific, testable, and unique to the artifact — no generic boilerplate.

6. **Component requirements**: Use "# Responsibility" section with "The system shall..." paragraphs describing component behavior. Include "# Constraints" section.

7. **Error handling**: Every FN file must include an "# Error Handling" section with specific "The system shall..." statements for failure scenarios.

8. **Status workflow**: idea -> draft -> review -> approved -> implemented. Child status must never exceed parent status.

9. **Templates**: Always use the templates from `requirements/templates/` as the basis.

10. **Cross-references**: Always as relative Markdown links, e.g. `[SOL-1](requirements/solutions/SOL-1_Verification.md)`

11. **Relationships** (optional): Frontmatter may include `relationships: { depends_on: [], constrains: [] }` for cross-cutting references between artifacts.

## Formulation Standard

Adopted from the meterverse-requirements reference style:

- **Components**: Multi-paragraph "The system shall..." statements under "# Responsibility". Each paragraph describes one independent, testable behavior.
- **Functions**: "# Functional Description" with a lead "The system shall..." sentence followed by bulleted "The system shall..." sub-points. "# Error Handling" with bulleted "The system shall..." failure behaviors.
- **User Stories**: "As a {specific role} I want to {concrete goal} So that {measurable benefit}." Acceptance criteria as specific, independently verifiable bullets with AC-IDs.
- **No generic content**: Every statement must be unique to the artifact it describes. Do not use placeholder text like "central processing step for US-x.y" or "core function of the component".

## Directory Structure

```
requirements/
├── 00_BUSINESS_CASE.md        # One BC per project
├── solutions/SOL-*.md         # Solution files
├── user-stories/US-*.md       # User story files
├── components/CMP-*.md        # Component files
├── functions/FN-*.md          # Function files
├── conversations/CONV-*.md    # Chatbot flows
├── notifications/NTF-*.md     # Notification definitions
├── infrastructure/INF-*.md    # Cross-cutting requirements
├── adrs/ADR-*.md              # Architecture decisions
├── analytics/                 # Event tracking catalog
└── templates/                 # Templates for all types
```

## Quality Criteria

- **No SOL without at least one US**
- **No US without acceptance criteria**
- **No CMP without at least one FN**
- **No orphaned references** — every link must point to an existing file
- **Edge cases documented** — as a table in the SOL file
- **INF references** — every CMP should reference relevant INFs (WCAG, OWASP, DSGVO)

## Metaketten Framework

This workspace uses the **Metaketten-Framework v2.0** — a 10-phase verification pipeline that governs all requirement creation, modification, and review.

**Read `metaketten.instructions.md` before processing any requirement artifact.** It defines:
- 10 phases (Phase 0: Init → Phase 10: Org Readiness)
- 7 gates (G0–G6) with mandatory checks and confidence thresholds
- 6 verification levels (L1–L6)
- 25 validation rules (V-001 to V-025)
- 4-dimension confidence scoring (structural/semantic/consistency/boundary)
- 5 probing agents (socratic, devils_advocate, constraint, example, boundary)

**Core Rule**: Every requirement modification must be evaluated against the Metaketten verification pipeline. Check the applicable gate, run validation rules V-001–V-025 for the artifact's scope, and verify confidence before proceeding.

## Agents

This workspace has specialized agents:
- **@discover** — Interview & Business Case generation (Phase 1: Semantische Dekonstruktion)
- **@architect** — Requirement hierarchy generation SOL -> US -> CMP -> FN (Phase 3: Architektur-Dekomposition)
- **@review** — Review requirements, find gaps, Metaketten compliance (Phases 2-6)
- **@export** — Requirement tree, Jira export, code scaffold (baseline/drift-aware)

Use the appropriate agent for each task.
