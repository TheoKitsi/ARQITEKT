---
type: component
id: CMP-3.3.1
status: draft
parent: US-3.3
version: "1.0"
date: "2026-03-15"
---

# CMP-3.3.1: Benchmark Vergleichsmodul

## Beschreibung

Laedt Benchmark-Zeitreihen (DAX, MSCI World, MSCI Europe, S und P 500, HVPI-Inflation) aus externem Daten-Provider. Normalisiert Daten auf gleichen Startzeitpunkt. Berechnet Outperformance in Prozentpunkten und absolut. Custom-Benchmark-Erstellung durch gewichtete Kombination.
## Abhaengigkeiten

- Externer Kurs-Provider (z.B. EOD Historical Data, Alpha Vantage)

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Benchmark-Zeitreihen von externem Provider, Portfolio-Zeitreihe |
| **Output** | Normalisierter Vergleichs-Chart, Outperformance in Prozentpunkten |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-3.3.1.1](../functions/FN-3.3.1.1_Benchmark_Daten_Laden.md) | Benchmark Daten Laden | draft |
| [FN-3.3.1.2](../functions/FN-3.3.1.2_Zeitreihen_Normalisieren.md) | Zeitreihen Normalisieren | draft |
| [FN-3.3.1.3](../functions/FN-3.3.1.3_Outperformance_Berechnen.md) | Outperformance Berechnen | draft |
| [FN-3.3.1.4](../functions/FN-3.3.1.4_Custom_Benchmark.md) | Custom Benchmark | draft |


---

## Constraints

Externe API-Abhaengigkeit: Circuit-Breaker und Fallback auf gecachte Daten. Max 5 Benchmarks gleichzeitig.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-5 | Benchmark-Daten taegliches Caching |
| INF-3 | Chart-Alternativtext fuer Screen-Reader |
