---
type: solution
id: SOL-9
title: "Compliance & Regulatorik"
status: approved
parent: BC-1
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: []
  downstream: []
---

# SOL-9: Compliance & Regulatorik

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: keine | downstream: keine





---

## System Boundaries

### In Scope

- Immutable Audit-Logging mit Hash-Chain-Sicherung.
- Compliance-Query-Interface mit CSV-Export.
- Aufbewahrungsfristen (HGB 10 Jahre, WpHG 5 Jahre).
- DSGVO-Loeschantrag-Workflow mit Pseudonymisierung.
- Loeschbestaetigung per E-Mail.

### Out of Scope

- Rechtliche Compliance-Beratung.
- Automatische Meldungen an Aufsichtsbehoerden (BaFin).
- Datenschutzfolgenabschaetzung (DSFA).

---

## User Story Index

| US-ID | Title | Status |
| --- | --- | --- |
| [US-9.1](../user-stories/US-9.1_Beratungsprotokoll_erstellen.md) | Beratungsprotokoll erstellen | draft |
| [US-9.2](../user-stories/US-9.2_DSGVO_Loeschantrag_verarbeiten.md) | DSGVO Loeschantrag verarbeiten | draft |

---

## Architecture Context

Frontend: Admin-UI (Audit-Query) | Backend: NestJS Audit-Service (immutable writes) | DB: PostgreSQL (append-only audit table, SHA-256 hash chain) | Archiv: S3 Glacier (Cold-Storage)

---

## Edge Cases (SOL-9)

| # | Szenario | Regel |
|---|---|---|
| EC-9.1 | **KI-Empfehlung im Beratungsprotokoll** | Jede KI-Empfehlung wird mit Zeitstempel, Modell-Version und Eingabedaten im Audit-Trail protokolliert. Disclaimer: "KI-generierte Empfehlung, keine persönliche Anlageberatung." |
| EC-9.2 | **Löschantrag bei laufender Beratung** | Beratungsprotokoll muss gemäß WpHG §83 für 5 Jahre aufbewahrt werden. Löschung nur für nicht-regulatorische Daten. Nutzer wird über Aufbewahrungspflicht informiert. |
| EC-9.3 | **Grenzüberschreitende Beratung (EU-Ausland)** | Automatische Erkennung des Nutzer-Standorts. Bei Nicht-DACH: Warnung an Berater, ggf. andere Regulatorik anwendbar. |
| EC-9.4 | **Audit-Anfrage durch BaFin** | Vollständiger Export aller Beratungsprotokolle, KI-Interaktionen und Szenario-Simulationen im standardisierten Format. One-Click-Export für Compliance-Officer. |
