# ARQITEKT — Framework Hub

> KI-gestütztes Requirements Engineering Framework

## Quick Start

```bash
npm run dashboard    # Dashboard starten → http://localhost:3333
```

Oder einfach `start.cmd` im übergeordneten Verzeichnis doppelklicken.

## Was ist ARQITEKT?

ARQITEKT ist ein Framework das **Requirements Engineering** mit **VS Code Copilot Agent Mode** kombiniert. Statt leere Dokumente zu befüllen, führen KI-Agents durch den gesamten Prozess:

1. **@discover** — Interview → Business Case
2. **@architect** — Business Case → Requirement-Hierarchie (SOL → US → CMP → FN)
3. **@review** — Qualitätsprüfung aller Requirements
4. **@export** — Export in Jira, Code-Scaffold, Tree

## Projektstruktur

```
ARQITEKT/                    ← Workspace Root
├── start.cmd                ← Doppelklick-Launcher
├── _ARQITEKT/               ← Dieses Framework (Hub)
│   ├── scripts/dashboard.mjs
│   └── template/            ← Blueprint für neue Projekte
├── 001_SOCIAL/              ← Projekt 1
├── 002_NextProject/         ← Projekt 2
└── ...
```

## Dashboard

Das Hub-Dashboard (Port 3333) zeigt alle Projekte und erlaubt:

- **Neues Projekt erstellen** — Template wird kopiert und konfiguriert
- **Projekt im Dashboard anzeigen** — Requirement-Tree, Stats, Validierung
- **Projekt in VS Code öffnen** — Copilot Agents sofort verfügbar
- **Projekt löschen** — Mit Bestätigung

## Side-by-Side Workflow

1. Dashboard links im Browser oder VS Code Simple Browser
2. Copilot Chat rechts (`Ctrl+Shift+I`)
3. Prompts per Klick kopieren → in Chat einfügen → ausführen
