---
type: component
id: CMP-6.1.1
status: draft
parent: US-6.1
version: "1.0"
date: "2026-03-15"
---

# CMP-6.1.1: Nebenkostenrechner

## Beschreibung

Berechnet alle Kaufnebenkosten einer Immobilie bundeslandspezifisch. Tabelle mit allen 16 Grunderwerbsteuersaetzen (3,5% bis 6,5%). Notarkosten pauschal 1,5%, Grundbuchkosten 0,5%, Maklerprovision konfigurierbar. Ergebnis: Gesamtkosten-Aufstellung und prozentualer Anteil am Kaufpreis.

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Kaufpreis, Bundesland, optionale Maklerprovision |
| **Output** | Aufstellung: Grunderwerbsteuer, Notar, Grundbuch, Makler, Gesamtkosten |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-6.1.1.1](../functions/FN-6.1.1.1_Grunderwerbsteuer_Berechnen.md) | Grunderwerbsteuer Berechnen | draft |
| [FN-6.1.1.2](../functions/FN-6.1.1.2_Notarkosten_Berechnen.md) | Notarkosten Berechnen | draft |
| [FN-6.1.1.3](../functions/FN-6.1.1.3_Grundbuchkosten_Berechnen.md) | Grundbuchkosten Berechnen | draft |
| [FN-6.1.1.4](../functions/FN-6.1.1.4_Gesamtkosten_Aufstellen.md) | Gesamtkosten Aufstellen | draft |


---

## Constraints

Grunderwerbsteuersaetze tabellarisch fuer 16 Bundeslaender. Notar 1.5%, Grundbuch 0.5% als Defaults. Makler konfigurierbar.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-4 | Bundesland-Namen und Steuersaetze lokalisiert |
