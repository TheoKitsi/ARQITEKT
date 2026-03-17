# ARQITEKT — Project Knowledge

## Overview

ARQITEKT is a KI-powered Requirements Engineering Framework. It provides a Hub Dashboard (localhost) that manages software projects from idea through requirements engineering to deployment (App Store, Web, API).

## Architecture

```
ARQITEKT/
├── _ARQITEKT/              # Framework Hub
│   ├── hub/                # NEW: Vite + React 19 + TypeScript frontend (port 5173 dev)
│   ├── server/             # NEW: Express.js + TypeScript backend (port 3334)
│   ├── scripts/            # LEGACY: vanilla JS server + frontend (port 3333)
│   ├── ui-catalogue/       # Design tokens + React component templates
│   └── template/           # Project template (metamodel.yaml, copilot agents)
├── mobile/                 # Flutter mobile companion app (planned)
├── 001_SOCIAL/ ... 006_SCS_PLAY/   # Project requirements (migrating to app repos)
└── CLAUDE.md               # This file
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
cd _ARQITEKT && npm run dashboard      # Old vanilla JS dashboard on :3333

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
| `_ARQITEKT/template/config/metamodel.yaml` | Single source of truth for requirements structure |
| `_ARQITEKT/ui-catalogue/tokens/*.json` | Design tokens (colors, typography, spacing, radii, shadows) |
| `_ARQITEKT/ui-catalogue/templates/*.tsx` | React component templates for code generation |
| `_ARQITEKT/hub/src/store/` | Redux Toolkit store with RTK Query API |
| `_ARQITEKT/server/src/` | Express backend with all API routes and services |
