---
type: component
id: CMP-2.2.1
status: draft
parent: US-2.2
version: "1.0"
date: "2026-03-15"
---

# CMP-2.2.1: Depot Sync Engine

## Beschreibung

Automatischer Abgleich von Depot-Positionen, Kursen und Transaktionen. Tagesaktuell per PSD2 oder manueller CSV-Import. Berechnet automatisch: Einstandskurs, realisierte/unrealisierte Gewinne, Haltedauer. Unterstuetzt Splits, Fusionen und Kapitalma??nahmen.
## Abhaengigkeiten

- CMP-2.1.1 (PSD2-Adapter) fuer Datenzugriff
- CMP-3.1.1 (Rendite-Rechner) konsumiert die synchronisierten Daten

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Depot-Rohdaten von finAPI oder CSV-Upload |
| **Output** | Normalisierte Depot-Positionen mit Einstandskurs und Haltedauer |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-2.2.1.1](../functions/FN-2.2.1.1_Positionen_Synchronisieren.md) | Positionen Synchronisieren | draft |
| [FN-2.2.1.2](../functions/FN-2.2.1.2_Einstandskurs_Berechnen.md) | Einstandskurs Berechnen | draft |
| [FN-2.2.1.3](../functions/FN-2.2.1.3_Kapitalmassnahmen_Verarbeiten.md) | Kapitalma nahmen Verarbeiten | draft |
| [FN-2.2.1.4](../functions/FN-2.2.1.4_CSV_Import.md) | CSV Import | draft |


---

## Constraints

Corporate Actions (Splits, Fusionen) automatisch erkennen. CSV-Import: Validierung gegen Schema, max 10MB.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-5 | Sync als Background-Job, kein Nutzer-Blocking |
| INF-1 | Depot-Daten verschluesselt speichern |
