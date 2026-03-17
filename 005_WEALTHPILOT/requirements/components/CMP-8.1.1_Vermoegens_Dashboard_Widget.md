---
type: component
id: CMP-8.1.1
status: draft
parent: US-8.1
version: "1.0"
date: "2026-03-15"
---

# CMP-8.1.1: Vermoegens Dashboard Widget

## Beschreibung

Zentrale Dashboard-Komponente. Gesamtvermoegen als Hero-Zahl mit Trend-Pfeil. 4 Quick-Stats-Karten: Rendite p.a., Sparquote, naechste Faelligkeit, groesste Position. Allokations-Donut-Chart (Asset-Klassen). Timeline-Chart: Vermoegen ueber 30/90/365 Tage. Responsive Layout von Desktop bis Tablet.
## Abhaengigkeiten

- CMP-3.2.1 (Portfolio-Aggregator) fuer aggregierte Daten
- D3.js oder Apache ECharts

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Aggregierte Portfolio-Daten von CMP-3.2.1 |
| **Output** | Dashboard: Hero-Zahl, Quick-Stats, Allokations-Donut, Vermoegen-Timeline |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-8.1.1.1](../functions/FN-8.1.1.1_Gesamtvermoegen_Anzeigen.md) | Gesamtvermoegen Anzeigen | draft |
| [FN-8.1.1.2](../functions/FN-8.1.1.2_Allokations_Chart.md) | Allokations Chart | draft |
| [FN-8.1.1.3](../functions/FN-8.1.1.3_Vermoegen_Timeline.md) | Vermoegen Timeline | draft |
| [FN-8.1.1.4](../functions/FN-8.1.1.4_Quick_Stats_Karten.md) | Quick Stats Karten | draft |


---

## Constraints

Responsive Desktop bis Tablet. Apache ECharts (ADR-3). Daten-Refresh alle 60s oder bei Nutzer-Aktion.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-3 | Dashboard-Widgets Screen-Reader-kompatibel |
| INF-5 | Dashboard LCP < 2.5s |
