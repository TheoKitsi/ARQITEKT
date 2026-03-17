# Social

> A serious dating platform for people seeking lasting partnerships.

Built on a **5-level funnel model** that guides users from core values to micro-preferences.
Verified identities, transparent matching, mutual consent, and privacy by design.

---

## Quick Start

1. Open folder in VS Code
2. Open Copilot Chat (Ctrl+Shift+I) in Agent Mode
3. Start working:

| Goal | Chat Command |
|---|---|
| Start a new project | @discover I have an idea for ... |
| Generate requirements | @architect Generate all User Stories for SOL-1 |
| Quality check | @review Check SOL-3 for completeness |
| Export | @export Create the Requirement Tree |

---

## Agents

- **@discover** — From idea to Business Case (interview -> BC)
- **@architect** — From BC to hierarchy (SOL->US->CMP->FN->CONV), modes: full/layer/single/cross
- **@review** — 6-dimension quality check (structural, referential, status, content, cross-cutting, gaps)
- **@export** — 5 formats (Requirement Tree, Jira JSON, Code Scaffold, Claude Context, Statistics)

---

## Entity Types

Core: BC -> SOL -> US -> CMP -> FN -> CONV
Cross-Cutting: INF (Infrastructure), NTF (Notifications), ADR (Architecture Decisions)

---

## NPM Scripts

```
npm run validate    # Metamodel validation
npm run tree        # Generate TREE.md
npm run stats       # Tree + statistics
npm run export:jira # Jira JSON
```

---

## Directory Structure

```
SOCIAL/
+-- config/           (metamodel.yaml, project.yaml)
+-- requirements/     (BC, solutions/, user-stories/, components/, functions/, ...)
+-- scripts/          (validate.mjs, tree.mjs, export-jira.mjs)
+-- .github/copilot/  (copilot-instructions.md, agents/, skills/)
+-- package.json
```