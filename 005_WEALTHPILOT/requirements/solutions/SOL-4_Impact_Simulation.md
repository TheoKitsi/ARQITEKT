---
type: solution
id: SOL-4
title: "Impact-Simulation (USP)"
status: approved
parent: BC-1
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: ["SOL-1", "SOL-3"]
  downstream: ["SOL-5", "SOL-8"]
---

# SOL-4: Impact-Simulation (USP)

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: SOL-1, SOL-3 | downstream: SOL-5, SOL-8





---

## System Boundaries

### In Scope

- Umschichtungskonfiguration (Quell- und Ziel-Positionen).
- Cross-Impact-Berechnung (Rendite-Delta, Opportunitaetskosten, Steuerlast).
- Visualisierung als Sankey- und Waterfall-Charts.
- Multi-Szenario-Vergleich und Optimierungsvorschlag.
- Impact-Score-Berechnung (-100 bis +100).

### Out of Scope

- Ausfuehrung von Transaktionen (kein Trading).
- Bankuebergreifende Umschichtung (nur innerhalb verfuegbarer Positionen).
- Steuerberatung im rechtlichen Sinne.

---

## User Story Index

| US-ID | Title | Status |
| --- | --- | --- |
| [US-4.1](../user-stories/US-4.1_Kapital_Umschichtung_definieren.md) | Kapital Umschichtung definieren | draft |
| [US-4.2](../user-stories/US-4.2_Cross_Impact_berechnen_und_visualisieren.md) | Cross Impact berechnen und visualisieren | draft |
| [US-4.3](../user-stories/US-4.3_Optimale_Umschichtungsstrategie_vorschlagen.md) | Optimale Umschichtungsstrategie vorschlagen | draft |

---

## Architecture Context

Frontend: ECharts Sankey + Waterfall | Backend: NestJS Impact-Engine (stateless Berechnung) | Cache: Redis (Szenario-Snapshots) | Algo: Lineare Optimierung (Simplex-Variante)

---

## Edge Cases (SOL-4)

| # | Szenario | Regel |
|---|---|---|
| EC-4.1 | **Umschichtungsbetrag > verfügbares Kapital** | Validierung beim Eingeben. Rote Warnung: "Nicht genug liquides Kapital. Verfügbar: €X". System schlägt automatisch Quellen-Kombination vor. |
| EC-4.2 | **Gesperrte Positionen (Sperrfrist, Mindesthaltedauer)** | In der Quellen-Auswahl als "gesperrt bis TT.MM.JJJJ" markieren. Nicht für Umschichtung auswählbar. Alternativ: Strafgebühr einrechnen. |
| EC-4.3 | **Vorabpauschale bei Fondsverkauf** | System berechnet anfallende Vorabpauschale gem. §18 InvStG und zeigt sie als separaten Impact-Faktor. |
| EC-4.4 | **Mehrere Szenarien gleichzeitig vergleichen** | Bis zu 5 Szenarien parallel vergleichen (Side-by-side oder Overlay-Chart). Bestes Szenario automatisch hervorheben. |
| EC-4.5 | **Kapitalertragsteuer-Freibetrag bereits ausgeschöpft** | System prüft bisherigen Freibetrag-Verbrauch (€1.000 p.P. / €2.000 Zusammenveranlagung). Steuerlast korrekt einberechnen. |
| EC-4.6 | **Regelmäßige Sparpläne betroffen** | Wenn Umschichtung bestehende Sparpläne beeinflusst (z.B. Depot wird aufgelöst), Warnung: "Sparplan auf Position X wird beendet". |
