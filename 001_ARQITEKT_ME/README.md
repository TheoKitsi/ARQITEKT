# {{PROJECT_NAME}}

> ARQITEKT Requirements Engineering Projekt

## Quick Start

```bash
npm run validate    # Requirements gegen Metamodel prüfen
npm run tree        # Requirement-Tree generieren
npm run stats       # Statistiken anzeigen
npm run export:jira # Jira-Export erzeugen
```

## Copilot Agents

Öffne diesen Ordner in VS Code und nutze:

| Agent | Aufgabe |
|-------|---------|
| `@discover` | Business Case durch Interview erstellen |
| `@architect` | Requirements-Hierarchie generieren |
| `@review` | Qualitätsprüfung aller Requirements |
| `@export` | Export in verschiedene Formate |

## Struktur

```
requirements/
├── 00_BUSINESS_CASE.md
├── solutions/        SOL-*
├── user-stories/     US-*
├── components/       CMP-*
├── functions/        FN-*
├── conversations/    CONV-*
├── infrastructure/   INF-*
├── notifications/    NTF-*
├── adrs/             ADR-*
└── templates/        Vorlagen für jede Entity
```
