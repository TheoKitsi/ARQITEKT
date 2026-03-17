---
type: infrastructure
id: INF-6
title: "State Management"
status: draft
version: "1.0"
date: "2026-03-15"
category: "State"
crossCutting: true
constrains: [all]
---

# INF-6: State Management

> **Category**: State
> **Cross-Cutting**: Applies to all relevant requirements

---

## Infrastructure Description

Definiert die Architektur fuer Client- und Server-seitige Zustandsverwaltung. WealthPilot hat komplexe Zustaende: Multi-Step-Formulare, laufende Simulationen, Chat-Konversationen, Echtzeit-Portfolio-Daten. Klare Trennung zwischen fluechtigem UI-State und persistentem Server-State.

---

## Non-Functional Constraints

| Rule-ID | Rule | Source | Mandatory |
|---|---|---|---|
| R-6.1 | Server-State: Single Source of Truth fuer alle Finanzdaten (DB) | Architektur | yes |
| R-6.2 | Client-State: UI-State (Formular-Schritte, Modale, Filter) lokal im Frontend | Architektur | yes |
| R-6.3 | Server-Cache-State: Berechnungsergebnisse in Redis mit TTL und Invalidierung | Architektur | yes |
| R-6.4 | Session-State: JWT-basiert, kein Server-seitiger Session-Store | Architektur | yes |
| R-6.5 | Optimistic Updates: UI aktualisiert sofort, Rollback bei Server-Fehler | UX | yes |
| R-6.6 | Offline-Toleranz: Dashboard zeigt zuletzt geladene Daten mit Timestamp-Warnung | UX | no |
| R-6.7 | Multi-Tab: Aenderungen in einem Tab propagieren via BroadcastChannel | UX | no |
| R-6.8 | Mandanten-Kontext: Tenant-ID in JWT-Claims, serverseitig validiert pro Request | Security | yes |

---

## Affected Requirements

| Requirement | Relevance | Note |
|---|---|---|
| CMP-1.1.1 | high | Multi-Step-Formular: Schritt-State, Draft-Persistierung |
| CMP-4.1.1 | high | Umschichtungs-Konfigurator: Drag-State, Zwischen-Ergebnisse |
| CMP-5.1.1 | high | Chat: Konversations-History, Streaming-State |
| CMP-8.1.1 | high | Dashboard: Aggregierte Daten, Refresh-Zyklen |
| CMP-3.1.1 | medium | Rendite-Cache: Invalidierungs-Logik |
| SOL-10 | high | Mandanten-Kontext: Tenant-Isolation auf State-Ebene |

---

## Verification Criteria

- [ ] Formular-Draft: Nutzer kann Browser schliessen und Formular fortsetzen
- [ ] Cache-Invalidierung: Neue Transaktion invalidiert Rendite-Cache innerhalb 5s
- [ ] Multi-Tenant: State-Leaks zwischen Mandanten ausgeschlossen (Pentest)
- [ ] Optimistic Update: Rollback-Animation bei Server-Fehler sichtbar

---

## Tooling / Automation

| Tool | Checks | Automated |
|---|---|---|
| Zustand / Redux Toolkit | Client-State-Management | yes |
| Redis | Server-Cache mit TTL | yes |
| BroadcastChannel API | Multi-Tab-Sync | yes |
| Cypress E2E | State-Persistenz-Tests | yes (CI) |
