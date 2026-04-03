# Metaketten-Framework v2.0 — Agent Instructions

> Read this file BEFORE processing any requirement artifact. It defines the
> verification pipeline that governs all requirement creation, modification,
> and review within ARQITEKT.

---

## 1. Pipeline Overview (10 Phases)

| Phase | Name                           | Input            | Output                        | Gate  |
|-------|--------------------------------|------------------|-------------------------------|-------|
| 0     | Projekt-Initialisierung        | Raw idea         | project.yaml, skeleton        | —     |
| 1     | Semantische Dekonstruktion     | Idea text        | BC with WHO/WHAT/WHY/FOR WHOM | G0    |
| 2     | Kontraktbasierte Verfeinerung  | BC               | SOL/US with contracts (pre/post/invariants) | G1, G2 |
| 3     | Architektur-Dekomposition      | SOL/US           | CMP/FN hierarchy              | G3, G4 |
| 4     | Formale Spezifikation          | FN               | Explicit pre/post-conditions  | G4    |
| 5     | Sicherheits- & Compliance-Audit| All artifacts    | OWASP/DSGVO/WCAG annotations | —     |
| 6     | UI/UX-Spezifikation            | User-facing US   | UISpec artifacts              | —     |
| 7     | Code-Generierung               | Approved FN      | Implementation scaffold       | G5    |
| 8     | Verifikation & Deployment      | Code + baseline  | Deployed, verified system     | G6    |
| 9     | Ökonomische Tragfähigkeit      | BC/SOL           | Effort/value/MVP analysis     | — (ROADMAP) |
| 10    | Organisatorische Reife         | All artifacts    | Team readiness assessment     | — (ROADMAP) |

---

## 2. Gate Reference (G0–G6)

| Gate | Transition    | Risk     | Threshold | Mandatory Checks |
|------|---------------|----------|-----------|-------------------|
| G0   | IDEA → BC     | medium   | 60%       | BC exists, WHO/WHAT/WHY/FOR WHOM present |
| G1   | BC → SOL      | medium   | 65%       | ≥1 SOL linked to BC, scope defined |
| G2   | SOL → US      | high     | 70%       | US has actor+action+benefit, acceptance criteria present |
| G3   | US → CMP      | high     | 75%       | CMP linked to US, responsibility defined |
| G4   | CMP → FN      | high     | 80%       | FN has functional description, error handling |
| G5   | FN → CODE     | critical | 85%       | All FN approved, no contradictions, edge cases ≥ 3 |
| G6   | CODE → DEPLOY | critical | 95%       | All approved, baseline clean, V-001–V-025 pass, no orphans |

**Gate Decision Logic:**
- All mandatory checks pass AND confidence ≥ threshold → PASS
- Mandatory checks pass BUT confidence < threshold → PROBING (agent questions)
- Any mandatory check fails → BLOCK

---

## 3. Verification Levels (L1–L6)

| Level | Name                    | Method                     | Applies To      |
|-------|-------------------------|----------------------------|-----------------|
| L1    | Schema-Validierung      | Regex, YAML structure      | All artifacts   |
| L2    | Referenz-Integrität     | Link/parent resolution     | All artifacts   |
| L3    | Semantische Kohärenz    | LLM content analysis       | US, FN, CMP     |
| L4    | Kontraktprüfung         | Pre/post-condition logic   | FN              |
| L5    | Grenzwert-Analyse       | Edge case enumeration      | FN              |
| L6    | Meta-Verifikation       | Cross-artifact consistency | Full hierarchy  |

Levels are cumulative: L3 includes L1+L2. An artifact must pass ALL levels up to its
required verification level before its gate can pass.

---

## 4. Probing Agent Assignment

| Agent            | Role                              | Used At Gates |
|------------------|-----------------------------------|---------------|
| socratic         | Clarifying questions, ambiguity   | G0, G1        |
| devils_advocate  | Challenge assumptions, contradictions | G2, G3    |
| constraint       | Technical/regulatory constraints  | G4, G5, G6    |
| example          | Concrete scenario synthesis       | G2, G3        |
| boundary         | Edge cases, failure modes         | G4, G5, G6    |

Agents are invoked ONLY when gate confidence is below threshold but mandatory checks pass.

---

## 5. Confidence Scoring

```
confidence = 0.30 × structural
           + 0.30 × semantic
           + 0.20 × consistency
           + 0.20 × boundary
```

| Dimension   | Weight | What It Measures |
|-------------|--------|------------------|
| Structural  | 30%    | Required fields, sections, hierarchy depth |
| Semantic    | 30%    | Content quality, clarity, specificity (LLM-evaluated) |
| Consistency | 20%    | Cross-references, naming, status alignment |
| Boundary    | 20%    | Scope definition, edge cases, acceptance criteria |

**Cutoff:** confidence ≥ 95% bypasses probing entirely.

---

## 6. Validation Rules Quick-Reference (V-001 to V-025)

### Rule-Based (L1/L2)
| Rule  | Scope    | Check |
|-------|----------|-------|
| V-001 | All      | Unique artifact IDs across project |
| V-002 | All      | ID matches naming pattern from metamodel |
| V-003 | All      | Non-root artifacts have valid parent reference |
| V-004 | All      | Status is one of: idea, draft, review, approved, implemented |
| V-005 | All      | Child status ≤ parent status |
| V-006 | All      | Required frontmatter fields present |
| V-007 | All      | Referenced files exist on disk |
| V-008 | All      | No duplicate titles within same entity type |

### Semantic (L3–L6)
| Rule  | Scope    | Check |
|-------|----------|-------|
| V-009 | BC       | WHO/WHAT/WHY/FOR WHOM all present |
| V-010 | US       | Follows "As a ... I want to ... So that ..." format |
| V-011 | US       | Has ≥ 3 testable acceptance criteria |
| V-012 | CMP      | "The system shall..." in Responsibility section |
| V-013 | CMP      | References relevant INF (WCAG/OWASP/DSGVO) |
| V-014 | FN       | "The system shall..." in Functional Description |
| V-015 | FN       | Error Handling section present |
| V-016 | SOL      | Has ≥ 1 child US |
| V-017 | US       | Has ≥ 1 child CMP |
| V-018 | CMP      | Has ≥ 1 child FN |
| V-019 | FN       | Confidence score ≥ gate threshold |
| V-020 | FN       | ≥ 3 edge cases documented |

### Metaketten v2.0
| Rule  | Scope    | Check | Phase |
|-------|----------|-------|-------|
| V-021 | US       | Given/When/Then with concrete values | 2 |
| V-022 | FN       | Explicit pre/post-conditions stated | 4 |
| V-023 | FN       | No contradictions between sibling FNs | 2 |
| V-024 | US       | User-facing US has UISpec artifact | 6 |
| V-025 | BC       | estimated_effort + business_value present (low severity) | 9 |

---

## 7. Artifact Hierarchy

```
BC (Business Case) — 1 per project
└── SOL (Solution) — feature area
    └── US (User Story) — user perspective
        ├── CMP (Component) — technical module
        │   └── FN (Function) — atomic behavior
        │       └── CONV (Conversation) — dialog flow [optional]
        └── UISpec — UI specification [Phase 6]

Cross-cutting: INF, ADR, NTF, FBK
```

---

## 8. Knowledge Integrity

- **Baseline**: SHA-256 content hash snapshot → `.arqitekt/baseline.json`
- **Drift Detection**: Compares current vs. baseline → reports: added, removed, title_changed, status_regressed, parent_changed, content_changed
- **Traceability Matrix**: Parent/child links across full hierarchy; orphan detection; impact analysis (direct + transitive)

**Rule**: Never export or deploy when drift report shows regressions.

---

## 9. Agent Behavior Rules

1. **Read metamodel.yaml first** — before any artifact operation
2. **Check applicable gate** — determine which phase/gate applies to current artifact
3. **Apply validation rules** — run V-001 through V-025 for the artifact's scope
4. **Evaluate confidence** — use 4-dimension formula before gate decision
5. **Invoke probing only when needed** — confidence below threshold, mandatory checks pass
6. **Respect status workflow** — idea → draft → review → approved → implemented (forward only)
7. **Maintain traceability** — every artifact must be reachable from BC root
8. **Check drift before export** — verify baseline is clean before any export or deployment operation
