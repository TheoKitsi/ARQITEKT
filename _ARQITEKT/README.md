# ARQITEKT Hub

**Dashboard + API Server for the ARQITEKT Framework** | **Dashboard + API-Server fuer das ARQITEKT-Framework**

---

## EN: Hub Architecture

The Hub provides a web dashboard and REST API for managing ARQITEKT projects.

### Components

| Component | Path | Port | Technology |
|-----------|------|------|-----------|
| Frontend | `hub/` | 5173 (dev) | Vite + React 19 + TypeScript |
| Backend | `server/` | 3334 | Express.js + TypeScript |
| UI Catalogue | `ui-catalogue/` | — | Design tokens + component templates |
| Project Template | `template/` | — | Metamodel, agents, validation scripts |

### Commands

```bash
# Frontend
cd hub && npm install && npm run dev    # Dev server on :5173
cd hub && npm run build                 # Production build
cd hub && npm test                      # Vitest unit tests
cd hub && npx playwright test           # E2E tests

# Backend
cd server && npm install && npm run dev # Dev server on :3334
cd server && npm test                   # Vitest backend tests
```

### API Endpoints (40+)

| Group | Example Endpoints |
|-------|------------------|
| Projects | GET/POST `/api/projects`, GET `/api/projects/:id` |
| Requirements | GET `/api/projects/:id/requirements/tree`, PUT `/api/projects/:id/set-status` |
| Pipeline | GET `/api/projects/:id/pipeline`, POST `/api/projects/:id/pipeline/gate` |
| Probing | POST `/api/projects/:id/probing/analyze`, `/probing/question`, `/probing/answer` |
| Baseline | POST `/api/projects/:id/baseline`, GET `/api/projects/:id/drift` |
| Traceability | GET `/api/projects/:id/traceability`, `/traceability/orphans` |
| Chat | POST `/api/chat/send`, GET `/api/chat/models` |
| Feedback | GET/POST `/api/projects/:id/feedback` |
| Deploy | POST `/api/projects/:id/scaffold`, `/codegen`, `/export/issues`, `/github/push` |
| Hub | GET `/api/hub/health`, `/api/hub/version`, `/api/hub/update/check` |

### Configuration

| File | Purpose |
|------|---------|
| `config/llm.yaml` | LLM provider, model, fallback chain |
| `config/projects.yaml` | Registered projects (mode: internal/external) |
| `config/update.yaml` | Update channel settings |
| `template/config/metamodel.yaml` | Requirements hierarchy, gates, validation rules |
| `template/config/agents.yaml` | AI probing agent personas |

---

## DE: Hub-Architektur

Der Hub bietet ein Web-Dashboard und eine REST-API zur Verwaltung von ARQITEKT-Projekten.

### Befehle

```bash
# Frontend
cd hub && npm install && npm run dev    # Dev-Server auf :5173
cd hub && npm run build                 # Produktions-Build

# Backend
cd server && npm install && npm run dev # Dev-Server auf :3334
```

### Konfiguration

LLM-Einstellungen in `config/llm.yaml`. API-Key wird ueber Umgebungsvariablen geladen (siehe `.env.compose.example` im Root).

