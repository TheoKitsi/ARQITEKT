---
type: component
id: CMP-3.1.1
status: draft
parent: US-3.1
version: "1.0"
date: "2026-03-15"
---

# CMP-3.1.1: Rendite Rechner

## Beschreibung

Berechnet historische Renditen nach TTWROR (True Time-Weighted Rate of Return) und MWR (Money-Weighted Return). Beruecksichtigt Cash-Flows (Einzahlungen, Entnahmen, Dividenden, Gebuehren). Ergebnisse werden gecacht und bei neuen Transaktionen inkrementell aktualisiert.
## Abhaengigkeiten

- CMP-2.2.1 (Depot Sync Engine) liefert Transaktionsdaten

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Transaktionshistorie (Kaeufe, Verkaeufe, Dividenden, Gebuehren) pro Position |
| **Output** | TTWROR und MWR pro Position mit Zeitreihe |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-3.1.1.1](../functions/FN-3.1.1.1_TTWROR_Berechnung.md) | TTWROR Berechnung | draft |
| [FN-3.1.1.2](../functions/FN-3.1.1.2_MWR_Berechnung.md) | MWR Berechnung | draft |
| [FN-3.1.1.3](../functions/FN-3.1.1.3_Dividenden_Einbeziehen.md) | Dividenden Einbeziehen | draft |
| [FN-3.1.1.4](../functions/FN-3.1.1.4_Rendite_Cache.md) | Rendite Cache | draft |


---

## Constraints

Numerische Praezision: 6 Dezimalstellen. Cache-Invalidierung bei neuen Transaktionen. Inkrementelle Berechnung.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-5 | Rendite-Cache mit TTL und Invalidierung |
| INF-5 | P95 < 2000ms fuer Berechnung |
