---
type: component
id: CMP-6.3.1
status: draft
parent: US-6.3
version: "1.0"
date: "2026-03-15"
---

# CMP-6.3.1: Miet Kauf Vergleichsmodul

## Beschreibung

Vergleicht die Total Cost of Ownership zwischen Mieten und Kaufen ueber konfigurierbare Zeitraeume. Beruecksichtigt: Mietsteigerung (individuell oder Mietspiegel-basiert), Wertsteigerung der Immobilie, Instandhaltungsruecklagen (1-1,5% p.a.), Opportunitaetskosten des gebundenen Eigenkapitals. Break-Even-Berechnung und Linien-Chart Kauf-vs-Miet-Kosten.
## Abhaengigkeiten

- CMP-6.2.1 (Tilgungsplan) fuer Finanzierungskosten
- CMP-3.1.1 (Rendite-Rechner) fuer Opportunitaetskosten des Eigenkapitals

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Kaufpreis, Miethoehe, Mietsteigerung, Wertsteigerung, Instandhaltung, Eigenkapital |
| **Output** | Break-Even-Zeitpunkt, Linien-Chart Kauf vs. Miet, Opportunitaetskosten |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-6.3.1.1](../functions/FN-6.3.1.1_Mietkosten_Projizieren.md) | Mietkosten Projizieren | draft |
| [FN-6.3.1.2](../functions/FN-6.3.1.2_Kaufkosten_Projizieren.md) | Kaufkosten Projizieren | draft |
| [FN-6.3.1.3](../functions/FN-6.3.1.3_Break_Even_Berechnen.md) | Break Even Berechnen | draft |
| [FN-6.3.1.4](../functions/FN-6.3.1.4_Opportunitaetskosten_Eigenkapital.md) | Opportunitaetskosten Eigenkapital | draft |


---

## Constraints

Instandhaltung 1-1.5% p.a. Mietsteigerung individuell oder Mietspiegel. Opportunitaetskosten Eigenkapital via CMP-3.1.1.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-3 | Break-Even-Chart mit Alternativtext |
| INF-5 | Berechnung < 1s |
