---
type: user-story
id: US-9.2
title: "DSGVO Loeschantrag verarbeiten"
status: approved
parent: SOL-9
version: "1.0"
date: "2026-03-15"
---

# US-9.2: DSGVO Loeschantrag verarbeiten

> **Parent**: [SOL-9](../solutions/SOL-9_Compliance_und_Regulatorik.md)

---

## User Story

Als Nutzer moechte ich meine Daten loeschen lassen, damit mein Recht auf Vergessenwerden gemaess DSGVO Art. 17 umgesetzt wird.

---

## Acceptance Criteria

- [ ] AC-US-9.2.1: Loeschantrag ueber Self-Service im Profil stellbar
- [ ] AC-US-9.2.2: System prueft automatisch Aufbewahrungspflichten (WpHG 5 Jahre, HGB 10 Jahre)
- [ ] AC-US-9.2.3: Nicht-regulatorische Daten werden innerhalb 30 Tagen geloescht
- [ ] AC-US-9.2.4: Nutzer erhaelt Bestaetigung mit Liste der geloeschten und aufbewahrten Datenkategorien

---

## Components

| CMP-ID | Title | Status |
| --- | --- | --- |
| [CMP-9.2.1](../components/CMP-9.2.1_DSGVO_Loeschmodul.md) | DSGVO Loeschmodul | draft |

---

## Wireframe Reference

<!-- TODO: Link to wireframe files when available. -->

---

## Notifications

| Trigger | NTF | Channels |
| --- | --- | --- |
| Loeschantrag eingegangen | NTF-DELETION-REQUEST | E-Mail |
| Loeschung abgeschlossen | NTF-DELETION-CONFIRM | E-Mail + PDF |

