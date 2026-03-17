---
type: solution
id: SOL-6
title: "Immobilien-Modul"
status: approved
parent: BC-1
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: ["SOL-1"]
  downstream: ["SOL-8"]
---

# SOL-6: Immobilien-Modul

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: SOL-1 | downstream: SOL-8





---

## System Boundaries

### In Scope

- Nebenkostenberechnung fuer Immobilienkauf (Grunderwerbsteuer, Notar, Makler).
- Tilgungsplan-Generierung fuer Annuitaetendarlehen.
- Miet-vs.-Kauf-Vergleich ueber konfigurierbaren Zeithorizont.

### Out of Scope

- Immobilienbewertung / Marktpreisanalyse.
- Vermittlung von Finanzierungsprodukten.
- Mietrecht oder juristische Beratung.

---

## User Story Index

| US-ID | Title | Status |
| --- | --- | --- |
| [US-6.1](../user-stories/US-6.1_Immobilien_Kaufkosten_berechnen.md) | Immobilien Kaufkosten berechnen | draft |
| [US-6.2](../user-stories/US-6.2_Finanzierungsplan_erstellen.md) | Finanzierungsplan erstellen | draft |
| [US-6.3](../user-stories/US-6.3_Miet_vs_Kauf_Vergleich_durchfuehren.md) | Miet vs Kauf Vergleich durchfuehren | draft |

---

## Architecture Context

Frontend: Next.js Step-Wizard | Backend: NestJS Berechnungs-Endpunkte (stateless) | DB: PostgreSQL (Bundesland-Steuersaetze) | Charts: ECharts Line + Bar

---

## Edge Cases (SOL-6)

| # | Szenario | Regel |
|---|---|---|
| EC-6.1 | **Variable Zinsen nach Zinsbindung** | System zeigt Restschuld nach Zinsbindung und simuliert 3 Szenarien: Zins +1%, +2%, +3%. Warnung bei hoher Restschuld. |
| EC-6.2 | **KfW-Förderung anwendbar** | KfW-Darlehen als separate Position. Tilgungszuschuss korrekt verrechnen. Aktueller Fördersatz automatisch abrufen. |
| EC-6.3 | **Erbbaurecht statt Grundstückskauf** | Separate Berechnung mit Erbbauzins statt Grundstückspreis. Inflationsanpassung des Erbbauzinses einrechnen. |
| EC-6.4 | **Eigenkapital kommt aus mehreren Quellen** | Direkte Integration mit SOL-4: Umschichtung aus Depot A + Tagesgeld B + Bausparer C. Impact-Score für Gesamtkombination. |
