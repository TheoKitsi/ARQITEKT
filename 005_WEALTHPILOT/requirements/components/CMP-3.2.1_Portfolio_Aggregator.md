---
type: component
id: CMP-3.2.1
status: draft
parent: US-3.2
version: "1.0"
date: "2026-03-15"
---

# CMP-3.2.1: Portfolio Aggregator

## Beschreibung

Aggregiert Einzelrenditen zu einer gewichteten Gesamtrendite pro Depot, pro Asset-Klasse und gesamt. Netto-Rendite-Berechnung beruecksichtigt pauschal 26,375% Abgeltungssteuer + Soli auf realisierte Gewinne. Unterstuetzt Freistellungsauftrag-Verrechnung.
## Abhaengigkeiten

- CMP-3.1.1 (Rendite-Rechner) liefert Positions-Renditen

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Positions-Renditen von CMP-3.1.1, Asset-Klassen-Zuordnung |
| **Output** | Gewichtete Gesamtrendite, Asset-Klassen-Aufschluesselung, Netto-Rendite |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-3.2.1.1](../functions/FN-3.2.1.1_Gewichtete_Gesamtrendite.md) | Gewichtete Gesamtrendite | draft |
| [FN-3.2.1.2](../functions/FN-3.2.1.2_Asset_Klassen_Aufschluesselung.md) | Asset Klassen Aufschluesselung | draft |
| [FN-3.2.1.3](../functions/FN-3.2.1.3_Netto_Rendite_Berechnung.md) | Netto Rendite Berechnung | draft |
| [FN-3.2.1.4](../functions/FN-3.2.1.4_Soll_Ist_Vergleich.md) | Soll Ist Vergleich | draft |


---

## Constraints

Abgeltungssteuer 26,375% + Soli auf realisierte Gewinne. Freistellungsauftrag-Verrechnung (801 EUR / 1.602 EUR).


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-4 | Steuersaetze laenderspezifisch (DE/AT/CH) |
| INF-5 | Aggregation < 500ms |
