---
type: component
id: CMP-6.2.1
status: draft
parent: US-6.2
version: "1.0"
date: "2026-03-15"
---

# CMP-6.2.1: Tilgungsplan Generator

## Beschreibung

Annuitaetenrechner mit monatlicher Granularitaet. Eingaben: Darlehenssumme, Sollzins, anfaengliche Tilgung, Sondertilgungsoption. Generiert vollstaendigen Tilgungsplan als Tabelle. Zusaetzlich: 3 Anschlussfinanzierungs-Szenarien (Zinssatz +0%, +1%, +2%) nach Zinsbindungsende.
## Abhaengigkeiten

- CMP-6.1.1 (Nebenkostenrechner) liefert die Finanzierungsluecke

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Darlehenssumme, Sollzins, Tilgungssatz, Sondertilgungs-Option, Zinsbindung |
| **Output** | Monatlicher Tilgungsplan (Tabelle), 3 Anschlussfinanzierungs-Szenarien |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-6.2.1.1](../functions/FN-6.2.1.1_Annuitaet_Berechnen.md) | Annuitaet Berechnen | draft |
| [FN-6.2.1.2](../functions/FN-6.2.1.2_Tilgungsplan_Erstellen.md) | Tilgungsplan Erstellen | draft |
| [FN-6.2.1.3](../functions/FN-6.2.1.3_Anschlussfinanzierung_Simulieren.md) | Anschlussfinanzierung Simulieren | draft |
| [FN-6.2.1.4](../functions/FN-6.2.1.4_Sondertilgung_Einplanen.md) | Sondertilgung Einplanen | draft |


---

## Constraints

Annuitaetenberechnung monatliche Granularitaet. Max 40 Jahre Laufzeit. Anschlussfinanzierung: +0%, +1%, +2% Zins.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-5 | Tilgungsplan-Berechnung < 500ms |
| INF-3 | Tabelle barrierefrei mit scope-Attributen |
