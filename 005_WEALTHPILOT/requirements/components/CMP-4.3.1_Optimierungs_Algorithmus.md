---
type: component
id: CMP-4.3.1
status: draft
parent: US-4.3
version: "1.0"
date: "2026-03-15"
---

# CMP-4.3.1: Optimierungs Algorithmus

## Beschreibung

Genetischer Algorithmus zur Findung optimaler Umschichtungsstrategien. Optimierungsfunktionen: (1) Minimaler Rendite-Verlust, (2) Maximale Liquiditaetserhaltung, (3) Steuerliche Effizienz (FIFO vs. LIFO-Optimierung). Generiert Top-3 Szenarien. Konvergenz typisch nach 50 Generationen bei 100er-Population.
## Abhaengigkeiten

- CMP-4.2.1 (Cross-Impact-Engine) als Bewertungsfunktion fuer Fitness-Score

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Portfolio-Snapshot, Umschichtungs-Constraints, Optimierungsziel |
| **Output** | Top-3 Szenarien mit Fitness-Score und Side-by-Side-Vergleich |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-4.3.1.1](../functions/FN-4.3.1.1_Szenarien_Generieren.md) | Szenarien Generieren | draft |
| [FN-4.3.1.2](../functions/FN-4.3.1.2_Fitness_Funktion_Auswerten.md) | Fitness Funktion Auswerten | draft |
| [FN-4.3.1.3](../functions/FN-4.3.1.3_Side_by_Side_Vergleich.md) | Side by Side Vergleich | draft |
| [FN-4.3.1.4](../functions/FN-4.3.1.4_Szenario_Exportieren.md) | Szenario Exportieren | draft |


---

## Constraints

Genetischer Algorithmus: 100er-Population, ~50 Generationen. Konvergenz-Timeout: 10s. FIFO vs LIFO Steueroptimierung.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-5 | Optimierung < 10s, Worker-Thread |
| INF-6 | Szenarien im Client-State fuer Vergleich |
