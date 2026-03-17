---
type: component
id: CMP-4.2.2
status: draft
parent: US-4.2
version: "1.0"
date: "2026-03-15"
---

# CMP-4.2.2: Impact Visualisierung

## Beschreibung

Visualisierungskomponente fuer Impact-Ergebnisse. Sankey-Diagramm fuer Kapitalfluesse (Quelle zu Ziel). Waterfall-Chart fuer Rendite-Deltas pro Position. Impact-Score als prominenter Gauge-Indikator. Vergleichs-Timeline: Vermoegenskurve mit und ohne Umschichtung. Alle Charts interaktiv mit Hover-Details.
## Abhaengigkeiten

- CMP-4.2.1 (Cross-Impact-Engine) liefert Berechnungsergebnisse
- D3.js oder Apache ECharts als Charting-Bibliothek

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Impact-Ergebnis-Objekt von CMP-4.2.1 |
| **Output** | Interaktive Charts: Sankey, Waterfall, Gauge, Timeline |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-4.2.2.1](../functions/FN-4.2.2.1_Sankey_Diagramm_Rendern.md) | Sankey Diagramm Rendern | draft |
| [FN-4.2.2.2](../functions/FN-4.2.2.2_Waterfall_Chart_Rendern.md) | Waterfall Chart Rendern | draft |
| [FN-4.2.2.3](../functions/FN-4.2.2.3_Impact_Gauge_Anzeigen.md) | Impact Gauge Anzeigen | draft |
| [FN-4.2.2.4](../functions/FN-4.2.2.4_Vergleichs_Timeline.md) | Vergleichs Timeline | draft |


---

## Constraints

Apache ECharts (ADR-3). Responsive 320-1920px. Datentabellen-Fallback fuer Accessibility. Mandanten-Theme.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-3 | Chart-Alternativtexte, Datentabellen-Fallback |
| INF-5 | Chart-Rendering < 500ms |
