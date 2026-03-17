---
type: component
id: CMP-7.1.1
status: draft
parent: US-7.1
version: "1.0"
date: "2026-03-15"
---

# CMP-7.1.1: Produktkatalog Suchmaschine

## Beschreibung

Facettierte Suche ueber den Produktkatalog des Mandanten. Indiziert: Produktname, ISIN, WKN, Asset-Klasse, Risikoklasse (1-7), TER, Performance-Daten. Elasticsearch-basiert mit Typeahead. Mandantenspezifisch: Nur freigeschaltete Produkte sind sichtbar. Fallback-Modus: Asset-Klassen-Suche ohne konkrete Produkte.
## Abhaengigkeiten

- Mandanten-Produktdatenbank (Import via CSV/API)

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Suchbegriff, Facetten-Filter (Asset-Klasse, Risikoklasse, TER-Range) |
| **Output** | Paginierte Produktliste mit Relevanz-Score |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-7.1.1.1](../functions/FN-7.1.1.1_Facettierte_Suche.md) | Facettierte Suche | draft |
| [FN-7.1.1.2](../functions/FN-7.1.1.2_Typeahead_Suche.md) | Typeahead Suche | draft |
| [FN-7.1.1.3](../functions/FN-7.1.1.3_Produkt_Detailansicht.md) | Produkt Detailansicht | draft |
| [FN-7.1.1.4](../functions/FN-7.1.1.4_Mandantenfilter.md) | Mandantenfilter | draft |


---

## Constraints

Elasticsearch-Index. Mandantenspezifisch: Nur freigeschaltete Produkte. Typeahead < 100ms. Fallback: Asset-Klassen ohne Produkte.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-5 | Typeahead < 100ms, Elasticsearch |
| INF-3 | Suchfeld und Ergebnisliste barrierefrei |
