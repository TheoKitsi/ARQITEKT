# ARQITEKT

**KI-powered Requirements Engineering Framework** | **KI-gestuetztes Requirements Engineering Framework**

---

## EN: Overview

ARQITEKT guides software projects from idea through structured requirements engineering to deployment. A Hub Dashboard (localhost) manages projects, validates requirements via a 6-gate pipeline (Metaketten), and integrates AI agents for quality assurance.

### Architecture

| Layer | Technology |
|-------|-----------|
| Hub Frontend | Vite + React 19 + TypeScript, Redux Toolkit + RTK Query |
| Hub Backend | Express.js + TypeScript, zod validation, Helmet CSP |
| Mobile App | Flutter + Riverpod, GoRouter, M3 dark theme |
| AI/LLM | Configurable via `llm.yaml` (DeepSeek, GitHub Models, OpenAI, Ollama) |
| DevOps | Docker Compose, Nginx reverse proxy |

### Quick Start

```bash
# Option 1: Double-click
start.cmd

# Option 2: Manual
cd _ARQITEKT/hub && npm run dev     # Frontend on :5173
cd _ARQITEKT/server && npm run dev  # Backend on :3334

# Option 3: Docker
docker compose up --build           # Hub on :80 (configurable via HUB_PORT)
```

### Project Structure

```
ARQITEKT/
  _ARQITEKT/          Framework Hub (frontend + backend + templates)
    hub/              Vite + React dashboard
    server/           Express.js API server
    config/           LLM, projects, update configuration
    template/         Project blueprint (metamodel, agents, prompts)
    ui-catalogue/     Design tokens + component templates
  mobile/             Flutter companion app (Android/iOS)
  docker-compose.yml  Production deployment
  .env.compose.example  Environment variable template
```

### Metaketten Pipeline

6 quality gates from idea to code:

```
G0: IDEA -> BC      Business Case (WHO/WHAT/WHY)
G1: BC -> SOL       Solutions linked to BC
G2: SOL -> US       User Stories with acceptance criteria
G3: US -> CMP       Components mapped to stories
G4: CMP -> FN       Functions with pre/post-conditions
G5: FN -> CODE      All functions approved, ready for implementation
```

Each gate includes mandatory checks, AI probing agents (socratic, devils_advocate, constraint, example, boundary), and 4-dimension confidence scoring (structural, semantic, consistency, boundary).

---

## DE: Ueberblick

ARQITEKT begleitet Softwareprojekte von der Idee ueber strukturiertes Requirements Engineering bis zum Deployment. Ein Hub-Dashboard (localhost) verwaltet Projekte, validiert Requirements ueber eine 6-Gate-Pipeline (Metaketten) und integriert KI-Agenten zur Qualitaetssicherung.

### Schnellstart

```bash
# Option 1: Doppelklick
start.cmd

# Option 2: Manuell
cd _ARQITEKT/hub && npm run dev     # Frontend auf :5173
cd _ARQITEKT/server && npm run dev  # Backend auf :3334

# Option 3: Docker
docker compose up --build           # Hub auf :80
```

### Requirements-Hierarchie (Metamodell)

```
BC (Business Case)
  SOL (Solution / Loesungsbereich)
    US (User Story)
      CMP (Component / Technisches Modul)
        FN (Function / Atomares Verhalten)
          CONV (Conversation) [optional]

Querschnitt: INF (Infrastructure), ADR (Architecture Decision), NTF (Notification), FBK (Feedback)
```

Status-Workflow: `idea` -> `draft` -> `review` -> `approved` -> `implemented`

---

## License

Copyright Messkraft / TheoKitsi

