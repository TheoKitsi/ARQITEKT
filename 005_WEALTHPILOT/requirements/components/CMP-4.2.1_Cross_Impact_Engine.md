---
type: component
id: CMP-4.2.1
status: draft
parent: US-4.2
version: "1.0"
date: "2026-03-15"
---

# CMP-4.2.1: Cross Impact Engine

## Beschreibung

Kern-Algorithmus der Plattform. Berechnet fuer jede betroffene Position die Rendite-Differenz vorher/nachher. Projiziert Opportunitaetskosten ueber 1/3/5/10 Jahre mit Monte-Carlo-Simulation (1000 Pfade). Beruecksichtigt: Korrelationen zwischen Asset-Klassen, steuerliche Auswirkungen (Gewinnrealisierung), Zinseszins-Effekte, Sparplan-Unterbrechungen. Generiert aggregierten Impact-Score (-100 bis +100).
## Abhaengigkeiten

- CMP-3.1.1 (Rendite-Rechner) fuer historische Rendite-Basisdaten
- CMP-3.3.1 (Benchmark) fuer Markt-Erwartungen
- CMP-1.3.1 (Risikoprofil) fuer risikoadjustierte Projektionen

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Umschichtungs-Konfiguration, Portfolio-Snapshot, Risikoprofil |
| **Output** | Impact-Ergebnis: Rendite-Deltas, Opportunitaetskosten, Steuer-Impact, Impact-Score (-100..+100) |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-4.2.1.1](../functions/FN-4.2.1.1_Rendite_Delta_Berechnen.md) | Rendite Delta Berechnen | draft |
| [FN-4.2.1.2](../functions/FN-4.2.1.2_Opportunitaetskosten_Projizieren.md) | Opportunitaetskosten Projizieren | draft |
| [FN-4.2.1.3](../functions/FN-4.2.1.3_Steuerliche_Auswirkung_Berechnen.md) | Steuerliche Auswirkung Berechnen | draft |
| [FN-4.2.1.4](../functions/FN-4.2.1.4_Impact_Score_Aggregieren.md) | Impact Score Aggregieren | draft |
| [FN-4.2.1.5](../functions/FN-4.2.1.5_Sparplan_Auswirkung.md) | Sparplan Auswirkung | draft |


---

## Constraints

Monte-Carlo: 1000 Pfade. P95 < 5000ms. Worker-Thread fuer CPU-intensive Berechnung. Deterministische Seed-Option fuer Tests.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-5 | Monte-Carlo P95 < 5s, Worker-Thread |
| INF-1 | Keine Persistierung von Simulations-Rohdaten |
