---
type: component
id: CMP-4.1.1
status: draft
parent: US-4.1
version: "1.0"
date: "2026-03-15"
---

# CMP-4.1.1: Umschichtungs Konfigurator

## Beschreibung

Drag-and-Drop-Interface zur Definition von Kapitalfluessen. Nutzer zieht Betraege von Quell-Positionen auf Ziel-Verwendungen. Echtzeit-Validierung: Verfuegbarkeitspruefung (Sperrfristen, Kuendigungsfristen), Mindestanlagebetraege, Liquiditaets-Reserve-Warnung wenn Notgroschen unterschritten wird.
## Abhaengigkeiten

- CMP-2.2.1 (Depot Sync) fuer aktuelle Positionsdaten
- CMP-1.2.1 (Einnahmen/Ausgaben) fuer Liquiditaets-Berechnung

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Drag-and-Drop: Quell-Positionen, Betrag, Ziel-Verwendung, Zeitrahmen |
| **Output** | Umschichtungs-Konfiguration als strukturiertes Objekt fuer CMP-4.2.1 |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-4.1.1.1](../functions/FN-4.1.1.1_Quell_Positionen_Waehlen.md) | Quell Positionen Waehlen | draft |
| [FN-4.1.1.2](../functions/FN-4.1.1.2_Betrag_Zuweisen.md) | Betrag Zuweisen | draft |
| [FN-4.1.1.3](../functions/FN-4.1.1.3_Ziel_Definieren.md) | Ziel Definieren | draft |
| [FN-4.1.1.4](../functions/FN-4.1.1.4_Zeitrahmen_Konfigurieren.md) | Zeitrahmen Konfigurieren | draft |
| [FN-4.1.1.5](../functions/FN-4.1.1.5_Liquiditaetsreserve_Warnung.md) | Liquiditaetsreserve Warnung | draft |


---

## Constraints

Echtzeit-Validierung: Verfuegbarkeit, Sperrfristen, Mindestanlage. Liquiditaetsreserve-Warnung bei < 3 Netto-Monatsgehaelter.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-3 | Drag-and-Drop mit Tastatur-Alternative |
| INF-6 | Formular-State mit Zwischen-Persistierung |
