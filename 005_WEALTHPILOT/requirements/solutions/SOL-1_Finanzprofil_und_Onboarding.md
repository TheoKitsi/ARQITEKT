---
type: solution
id: SOL-1
title: "Finanzprofil & Onboarding"
status: approved
parent: BC-1
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: []
  downstream: ["SOL-2", "SOL-3", "SOL-4", "SOL-5", "SOL-6", "SOL-7"]
---

# SOL-1: Finanzprofil & Onboarding

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: keine | downstream: SOL-2, SOL-3, SOL-4, SOL-5, SOL-6, SOL-7





---

## System Boundaries

### In Scope

- Manuelle Erfassung von Konten, Depots und Depot-Positionen.
- Einnahmen- und Ausgabenerfassung mit DIN-77230-Kategorisierung.
- Risikoprofil-Ermittlung gemaess WpHG-Anforderungen.
- Verschluesselte Speicherung aller Finanzdaten (AES-256).

### Out of Scope

- Automatische Kontoaggregation via PSD2 (siehe SOL-2).
- Renditeberechnung und Analyse (siehe SOL-3).
- Steuerliche Beratung oder Steuerberechnung.

---

## User Story Index

| US-ID | Title | Status |
| --- | --- | --- |
| [US-1.1](../user-stories/US-1.1_Konten_und_Depots_erfassen.md) | Konten und Depots erfassen | draft |
| [US-1.2](../user-stories/US-1.2_Einnahmen_Ausgaben_Profil_erstellen.md) | Einnahmen Ausgaben Profil erstellen | draft |
| [US-1.3](../user-stories/US-1.3_Risiko_Profil_ermitteln.md) | Risiko Profil ermitteln | draft |

---

## Architecture Context

Frontend: Next.js Formulare (React Hook Form + Zod) | Backend: NestJS CRUD-Endpunkte | DB: PostgreSQL (encrypted columns via pgcrypto) | Validation: Server-side ISO 13616

---

## Edge Cases (SOL-1)

| # | Szenario | Regel |
|---|---|---|
| EC-1.1 | **Nutzer hat keine Depots** | System erlaubt Profilerstellung nur mit Konten. Depot-Felder optional. Impact-Simulation eingeschränkt (nur Liquidität). |
| EC-1.2 | **Nutzer hat Depots bei nicht-PSD2-fähigen Banken** | Manuelle Eingabe-Option anbieten. Warnung: "Keine automatische Synchronisation möglich — Werte müssen manuell aktuell gehalten werden." |
| EC-1.3 | **Gemeinschaftskonto / Gemeinschaftsdepot** | Nutzer gibt Eigentumsanteil an (z.B. 50%). Nur der Eigenanteil fließt in Berechnungen ein. |
| EC-1.4 | **Ausländische Konten / Fremdwährungen** | Automatische Umrechnung zum Tageskurs via EZB-Referenzkurs. Warnung bei Fremdwährungs-Positionen: "Wechselkursrisiko nicht in Rendite eingerechnet." |
