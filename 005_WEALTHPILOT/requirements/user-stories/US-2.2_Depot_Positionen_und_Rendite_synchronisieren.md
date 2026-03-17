---
type: user-story
id: US-2.2
title: "Depot Positionen und Rendite synchronisieren"
status: approved
parent: SOL-2
version: "1.0"
date: "2026-03-15"
---

# US-2.2: Depot Positionen und Rendite synchronisieren

> **Parent**: [SOL-2](../solutions/SOL-2_Portfolio_Aggregation_und_Synchronisation.md)

---

## User Story

Als Nutzer moechte ich meine Depot-Positionen automatisch synchronisieren, damit aktuelle Kurse und Renditen ohne manuelle Eingabe verfuegbar sind.

---

## Acceptance Criteria

- [ ] AC-US-2.2.1: Depot-Positionen werden mit ISIN, aktueller Kurs, Stueckzahl und Gesamtwert synchronisiert
- [ ] AC-US-2.2.2: Kursdaten werden mindestens einmal taeglich aktualisiert (Schlusskurse)
- [ ] AC-US-2.2.3: Aenderungen gegenueber letzter Sync werden hervorgehoben (Gewinn/Verlust)
- [ ] AC-US-2.2.4: Manuelle Positionen koennen parallel zu synchronisierten existieren

---

## Components

| CMP-ID | Title | Status |
| --- | --- | --- |
| [CMP-2.2.1](../components/CMP-2.2.1_Depot_Sync_Engine.md) | Depot Sync Engine | draft |

---

## Wireframe Reference

<!-- TODO: Link to wireframe files when available. -->

---

## Notifications

| Trigger | NTF | Channels |
| --- | --- | --- |
| Depot-Sync fehlgeschlagen | NTF-SYNC-FAILED | In-App, E-Mail |

