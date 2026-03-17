---
type: component
id: CMP-7.2.1
status: draft
parent: US-7.2
version: "1.0"
date: "2026-03-15"
---

# CMP-7.2.1: Produkt Matching Engine

## Beschreibung

Scoring-Algorithmus der Produkte gegen Nutzerprofil matcht. Kriterien: Risikoklassen-Kompatibilitaet (harte Grenze per MiFID-II), Kosten (TER gewichtet), historische Performance, Diversifikationsbeitrag zum bestehenden Portfolio. MiFID-II-Geeignetheitspruefung als Pflicht-Gate vor Empfehlung. Transparenz-Flag fuer provisionsbasierte Produkte.
## Abhaengigkeiten

- CMP-1.3.1 (Risikoprofil) fuer Risikoklassifizierung
- CMP-7.1.1 (Produktkatalog) als Datenquelle

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Nutzerprofil (Risikoklasse, Portfolio), Produktkatalog |
| **Output** | Gerankte Empfehlungsliste mit Matching-Score und Geeignetheits-Flag |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-7.2.1.1](../functions/FN-7.2.1.1_Matching_Score_Berechnen.md) | Matching Score Berechnen | draft |
| [FN-7.2.1.2](../functions/FN-7.2.1.2_Geeignetheitspruefung.md) | Geeignetheitspruefung | draft |
| [FN-7.2.1.3](../functions/FN-7.2.1.3_Empfehlungen_Ranken.md) | Empfehlungen Ranken | draft |
| [FN-7.2.1.4](../functions/FN-7.2.1.4_Provisions_Transparenz.md) | Provisions Transparenz | draft |


---

## Constraints

MiFID-II-Gate: Risikoklasse des Produkts darf Nutzerprofil nicht uebersteigen. Provisionstransparenz Pflicht.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-2 | MiFID-II-Compliance als Security-Gate |
| INF-1 | Empfehlungshistorie auditiert |
