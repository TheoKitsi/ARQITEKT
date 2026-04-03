# ARQITEKT — Project Knowledge

## Overview

ARQITEKT is a KI-powered Requirements Engineering Framework. It provides a Hub Dashboard (localhost) that manages software projects from idea through requirements engineering to deployment (App Store, Web, API).

## Architecture

```
ARQITEKT/
├── _ARQITEKT/              # Framework Hub
│   ├── hub/                # Vite + React 19 + TypeScript frontend (port 5173 dev)
│   ├── server/             # Express.js + TypeScript backend (port 3334)
│   ├── ui-catalogue/       # Design tokens + React component templates
│   └── template/           # Project template (metamodel.yaml, copilot agents)
├── mobile/                 # Flutter mobile companion app (planned)
└── CLAUDE.md               # This file

# All projects are external (registered in _ARQITEKT/config/projects.yaml, mode: "external")
# Project data stored at: C:\Users\kitsi\Desktop\ARQITEKT_PROJECTS\
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 19 + TypeScript |
| State | Redux Toolkit + RTK Query |
| Backend | Express.js + TypeScript |
| Mobile | Flutter + Riverpod |
| i18n | react-i18next (DE/EN) |
| Editor | @monaco-editor/react |
| Terminal | xterm.js + node-pty (WebSocket) |
| YAML | js-yaml |
| Icons | lucide-react |
| Testing | Vitest + React Testing Library + Playwright |
| Validation | zod |

## Commands

```bash
# Frontend (hub)
cd _ARQITEKT/hub && npm run dev        # Vite dev server on :5173
cd _ARQITEKT/hub && npm run build      # Production build
cd _ARQITEKT/hub && npm test           # Vitest unit tests

# Backend (server)
cd _ARQITEKT/server && npm run dev     # Express dev server on :3334
cd _ARQITEKT/server && npm test        # Vitest backend tests

# Legacy (will be removed)
# cd _ARQITEKT && npm run dashboard      # Old vanilla JS dashboard on :3333

# E2E Tests
cd _ARQITEKT/hub && npx playwright test
```

## Metamodel (Requirements Hierarchy)

```
BC (Business Case) — one per project
  └── SOL (Solution) — feature area
       └── US (User Story) — user perspective
            └── CMP (Component) — technical module
                 └── FN (Function) — atomic behavior
                      └── CONV (Conversation) — chatbot dialog [optional]

Cross-cutting: INF (Infrastructure), ADR (Architecture Decision), NTF (Notification), FBK (Feedback)
```

Status workflow: `idea` → `draft` → `review` → `approved` → `implemented`

## Conventions

- All file operations use async `fs/promises` (never `readFileSync`)
- All child processes use `spawn` with streaming (never `execSync`)
- All errors propagate to global error handler (no empty `catch {}`)
- YAML parsing via `js-yaml` (no custom parsers)
- CORS configured to specific origins (no wildcard `*`)
- Body size limits on all POST endpoints
- Input validation via `zod` schemas
- CSS uses design tokens from `ui-catalogue/tokens/*.json`
- i18n keys in `src/i18n/locales/{de,en}.json`

## GitHub

- Owner: TheoKitsi
- Hub: TheoKitsi/ARQITEKT (this repo)
- Apps: TheoKitsi/social, TheoKitsi/scs-play, TheoKitsi/TK.Apps
- Requirements are migrating into each app's own repo

## Key Files

| File | Purpose |
|------|---------|
| `_ARQITEKT/template/config/metamodel.yaml` | Single source of truth for requirements structure, gates, validation rules |
| `_ARQITEKT/template/config/agents.yaml` | Agent persona definitions (socratic, devils_advocate, constraint, example, boundary) |
| `_ARQITEKT/template/config/prompts/*.md` | Prompt templates for probing agents |
| `_ARQITEKT/ui-catalogue/tokens/*.json` | Design tokens (colors, typography, spacing, radii, shadows) |
| `_ARQITEKT/ui-catalogue/templates/*.tsx` | React component templates for code generation |
| `_ARQITEKT/hub/src/store/` | Redux Toolkit store with RTK Query API |
| `_ARQITEKT/hub/src/store/api/pipelineApi.ts` | RTK Query hooks for pipeline, gates, confidence, probing |
| `_ARQITEKT/hub/src/store/api/baselineApi.ts` | RTK Query hooks for baseline, drift, traceability |
| `_ARQITEKT/hub/src/features/plan/PipelineView.tsx` | Horizontal pipeline visualization (IDEA→BC→SOL→US→CMP→FN→CODE) |
| `_ARQITEKT/hub/src/features/plan/GateDetail.tsx` | Slide-in panel with gate checks, gaps, override |
| `_ARQITEKT/hub/src/features/plan/ProbingDialog.tsx` | Modal with multiple-choice probing questions |
| `_ARQITEKT/hub/src/components/ui/ConfidenceBadge.tsx` | Color-coded confidence score badge with tooltip |
| `_ARQITEKT/server/src/` | Express backend with all API routes and services |
| `_ARQITEKT/server/src/services/requirements.ts` | Barrel re-export (split into tree, stats, validation, status, requirementHelpers) |
| `_ARQITEKT/server/src/services/tree.ts` | buildTree() — reads markdown frontmatter into TreeNode hierarchy |
| `_ARQITEKT/server/src/services/validation.ts` | validateProject() — V-001 through V-020 rule engine |
| `_ARQITEKT/server/src/services/stats.ts` | getStats(), getReadiness() — artifact counts and readiness scores |
| `_ARQITEKT/server/src/services/status.ts` | setRequirementStatus() — forward-only status transitions |
| `_ARQITEKT/server/src/services/requirementHelpers.ts` | Shared helpers: fmString(), findArtifactFile(), STATUS_ORDER |
| `_ARQITEKT/server/src/services/pipeline.ts` | Gate evaluation engine (G0-G5) |
| `_ARQITEKT/server/src/services/confidence.ts` | 4-dimension confidence scoring (structural/semantic/consistency/boundary) |
| `_ARQITEKT/server/src/services/probing.ts` | LLM-powered probing agent system |
| `_ARQITEKT/server/src/services/baseline.ts` | SHA-256 baseline snapshots and drift detection |
| `_ARQITEKT/server/src/services/traceability.ts` | Traceability matrix, orphan detection, impact analysis |
| `mobile/lib/features/pipeline/pipeline_screen.dart` | Flutter pipeline screen with gate cards and drift report |

## Metaketten Pipeline (Gate Engine)

The Metaketten-Framework ensures quality at every stage from idea to code via 6 gates:

```
G0: IDEA → BC     (Business Case exists with WHO/WHAT/WHY/FOR WHOM)
G1: BC → SOL      (Solutions linked to BC, scope defined)
G2: SOL → US      (User Stories with actors, acceptance criteria)
G3: US → CMP      (Components mapped to stories)
G4: CMP → FN      (Functions specified with pre/post-conditions)
G5: FN → CODE     (All functions approved, ready for implementation)
```

Each gate has:
- **Mandatory checks** — rule-based validations that must pass
- **Assigned agents** — LLM personas that probe for gaps (socratic, devils_advocate, constraint, example, boundary)
- **Auto-pass threshold** — confidence score above which probing is skipped
- **Risk level** — low/medium/high/critical

### Confidence Scoring

4-dimension score (0-100) written to artifact frontmatter:
- **Structural** (30%) — completeness of required fields, sections, hierarchy depth
- **Semantic** (30%) — LLM-evaluated content quality, clarity, specificity
- **Consistency** (20%) — cross-references, naming conventions, status alignment
- **Boundary** (20%) — scope definition, edge cases, acceptance criteria

### Validation Rules

20 validation rules (V-001 through V-020) in metamodel.yaml:
- V-001 to V-008: Rule-based (unique IDs, parent links, status values, frontmatter fields)
- V-009 to V-020: Semantic/LLM-powered (confidence thresholds, cross-reference coherence, ambiguity detection, completeness checks)

### Knowledge Integrity

- **Baseline**: SHA-256 content hashing → `.arqitekt/baseline.json` per project
- **Drift Detection**: Compares current tree vs baseline (added/removed/title_changed/status_regressed/parent_changed/content_changed)
- **Traceability Matrix**: Parent/child links across full hierarchy, orphan detection, impact analysis (direct + transitive)

## API Endpoints

### Pipeline & Probing
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/projects/:id/pipeline` | Full pipeline status with all gates |
| POST | `/api/projects/:id/pipeline/gate` | Evaluate a specific gate |
| POST | `/api/projects/:id/pipeline/override` | Manual gate override |
| GET | `/api/projects/:id/pipeline/confidence` | All artifact confidence scores |
| GET | `/api/projects/:id/pipeline/confidence/:artifactId` | Single artifact confidence |
| GET | `/api/projects/:id/pipeline/gaps` | All gaps across pipeline |
| POST | `/api/projects/:id/probing/analyze` | Analyze gaps for a gate |
| POST | `/api/projects/:id/probing/question` | Generate probing question |
| POST | `/api/projects/:id/probing/answer` | Process answer to probing question |
| POST | `/api/projects/:id/probing/skip` | Skip a probing question |
| GET | `/api/projects/:id/probing/gaps` | List all open probing gaps |

### Baseline & Traceability
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/projects/:id/baseline` | Create baseline snapshot |
| GET | `/api/projects/:id/baseline` | Get current baseline |
| GET | `/api/projects/:id/baseline/drift` | Check drift against baseline |
| GET | `/api/projects/:id/traceability` | Full traceability matrix |
| GET | `/api/projects/:id/traceability/orphans` | Find orphaned artifacts |
| GET | `/api/projects/:id/traceability/impact/:artifactId` | Impact analysis for artifact |
