---
type: component
id: CMP-1.2.1
status: draft
parent: US-1.2
version: "1.0"
date: "2026-03-15"
---

# CMP-1.2.1: Einnahmen Ausgaben Modul

## Beschreibung

Formular fuer regelmae??ige Einnahmen (Gehalt, Mieteinnahmen, Dividenden) und Ausgaben (Miete, Versicherungen, Sparplaene). Kategorisierung nach DIN 77230. Automatische Berechnung der Sparquote und des frei verfuegbaren Einkommens.

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Benutzereingaben: Einnahmen-/Ausgabenposten mit Betrag, Kategorie, Intervall |
| **Output** | Einnahmen-Ausgaben-Profil mit Sparquote und frei verfuegbarem Einkommen |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-1.2.1.1](../functions/FN-1.2.1.1_Einnahmen_Erfassen.md) | Einnahmen Erfassen | draft |
| [FN-1.2.1.2](../functions/FN-1.2.1.2_Ausgaben_Erfassen.md) | Ausgaben Erfassen | draft |
| [FN-1.2.1.3](../functions/FN-1.2.1.3_Sparquote_Berechnen.md) | Sparquote Berechnen | draft |
| [FN-1.2.1.4](../functions/FN-1.2.1.4_DIN77230_Kategorisierung.md) | DIN77230 Kategorisierung | draft |


---

## Constraints

DIN-77230-Kategorien als Pflicht-Taxonomie. Monatliche Normalisierung aller Intervalle.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-4 | DIN-77230-Kategorien in DE/EN |
| INF-3 | Formular-Barrierefreiheit |
