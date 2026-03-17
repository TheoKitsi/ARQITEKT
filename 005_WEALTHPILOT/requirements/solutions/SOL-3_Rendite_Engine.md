---
type: solution
id: SOL-3
title: "Rendite-Engine"
status: approved
parent: BC-1
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: ["SOL-1", "SOL-2"]
  downstream: ["SOL-4", "SOL-7", "SOL-8"]
---

# SOL-3: Rendite-Engine

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: SOL-1, SOL-2 | downstream: SOL-4, SOL-7, SOL-8





---

## System Boundaries

### In Scope

- TTWROR-Renditeberechnung pro Position und Portfolio.
- Portfolio-Aggregation ueber alle Konten und Depots.
- Benchmark-Vergleich (DAX, MSCI World, individuell).
- Historische Zeitreihenanalyse.

### Out of Scope

- Zukunftsprognosen oder Rendite-Prognosen.
- Impact-Simulation bei Umschichtung (siehe SOL-4).
- Produktempfehlungen (siehe SOL-7).

---

## User Story Index

| US-ID | Title | Status |
| --- | --- | --- |
| [US-3.1](../user-stories/US-3.1_Historische_Renditeberechnung_pro_Position.md) | Historische Renditeberechnung pro Position | draft |
| [US-3.2](../user-stories/US-3.2_Portfolio_Gesamtrendite_berechnen.md) | Portfolio Gesamtrendite berechnen | draft |
| [US-3.3](../user-stories/US-3.3_Benchmark_Vergleich_anzeigen.md) | Benchmark Vergleich anzeigen | draft |

---

## Architecture Context

Frontend: ECharts Rendite-Charts | Backend: NestJS Rendite-Service (TTWROR) | Cache: Redis (berechnete Zeitreihen) | DB: PostgreSQL (historische Kursdaten)

---

## Edge Cases (SOL-3)

| # | Szenario | Regel |
|---|---|---|
| EC-3.1 | **Position mit negativer Rendite** | Normal darstellen (rote Farbe). In Gesamtrendite korrekt einrechnen. Kein Alarm, aber Hinweis bei >-20%. |
| EC-3.2 | **Aktiensplit / Reverse Split** | Historische Kurse nachjustieren (adjustierte Preise). Split-Event in Timeline anzeigen. |
| EC-3.3 | **Dividenden in Fremdwährung** | Zum Zahlungstag-Kurs in EUR umrechnen. Separate Spalte "FX-Effekt" in Rendite-Aufstellung. |
| EC-3.4 | **Kein vollständiges Kalenderjahr an Daten** | Rendite annualisieren mit Hinweis "hochgerechnet". Nicht als Fakt darstellen. |
