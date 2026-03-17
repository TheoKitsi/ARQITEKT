---
type: user-story
id: US-9.1
title: "Beratungsprotokoll erstellen"
status: approved
parent: SOL-9
version: "1.0"
date: "2026-03-15"
---

# US-9.1: Beratungsprotokoll erstellen

> **Parent**: [SOL-9](../solutions/SOL-9_Compliance_und_Regulatorik.md)

---

## User Story

Als Berater moechte ich ein MiFID-II-konformes Beratungsprotokoll automatisch erstellen lassen, damit ich regulatorische Pflichten erfuelle.

---

## Acceptance Criteria

- [ ] AC-US-9.1.1: Automatische Protokollierung: Kundenprofil, angezeigte Produkte, KI-Empfehlungen, gewaehltes Szenario
- [ ] AC-US-9.1.2: Geeignetheitserklaerung wird aus Risikoprofil und gewaehltem Produkt generiert
- [ ] AC-US-9.1.3: Zeitstempel und Berater-ID fuer jeden Beratungsschritt
- [ ] AC-US-9.1.4: PDF-Export mit digitaler Signatur und Audit-Trail-Referenz

---

## Components

| CMP-ID | Title | Status |
| --- | --- | --- |
| [CMP-9.1.1](../components/CMP-9.1.1_Audit_Logger.md) | Audit Logger | draft |

---

## Wireframe Reference

<!-- TODO: Link to wireframe files when available. -->

---

## Notifications

| Trigger | NTF | Channels |
| --- | --- | --- |
| Hash-Chain-Bruch erkannt | NTF-AUDIT-BREACH | E-Mail (Admin) |

