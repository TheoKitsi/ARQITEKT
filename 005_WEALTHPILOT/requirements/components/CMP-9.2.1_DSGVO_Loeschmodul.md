---
type: component
id: CMP-9.2.1
status: draft
parent: US-9.2
version: "1.0"
date: "2026-03-15"
---

# CMP-9.2.1: DSGVO Loeschmodul

## Beschreibung

Automatisierte Verarbeitung von Loeschantraegen gemaess DSGVO Art. 17. Workflow: Antrag erfassen und pruefen, regulatorische Aufbewahrungspflichten identifizieren (WpHG 5J, HGB 10J, GwG 5J), nicht-regulatorische Daten sofort markieren, nach 30-Tage-Frist endgueltig loeschen, Bestaetigung an Nutzer senden. Audit-Trail der Loeschung selbst wird 3 Jahre aufbewahrt.
## Abhaengigkeiten

- CMP-9.1.1 (Audit-Logger) fuer Loeschprotokollierung

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Loeschantrag (Nutzer-ID, Datum), regulatorische Haltefristen-Tabelle |
| **Output** | Loeschprotokoll, Bestaetigung an Nutzer |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-9.2.1.1](../functions/FN-9.2.1.1_Loeschantrag_Erfassen.md) | Loeschantrag Erfassen | draft |
| [FN-9.2.1.2](../functions/FN-9.2.1.2_Aufbewahrungspflichten_Pruefen.md) | Aufbewahrungspflichten Pruefen | draft |
| [FN-9.2.1.3](../functions/FN-9.2.1.3_Daten_Loeschen.md) | Daten Loeschen | draft |
| [FN-9.2.1.4](../functions/FN-9.2.1.4_Loeschbestaetigung_Senden.md) | Loeschbestaetigung Senden | draft |


---

## Constraints

DSGVO Art. 17. Haltefristen: WpHG 5J, HGB 10J, GwG 5J. 30-Tage-Frist. Loeschprotokoll 3 Jahre aufbewahrt.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-1 | DSGVO Art. 17 Recht auf Loeschung |
| INF-7 | Automatisierter Cronjob fuer Fristablauf |
