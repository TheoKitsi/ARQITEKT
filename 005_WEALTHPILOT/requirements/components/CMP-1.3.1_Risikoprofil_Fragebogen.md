---
type: component
id: CMP-1.3.1
status: draft
parent: US-1.3
version: "1.0"
date: "2026-03-15"
---

# CMP-1.3.1: Risikoprofil Fragebogen

## Beschreibung

WpHG-konformer Fragebogen zur Ermittlung der Risikobereitschaft und Risikotragfaehigkeit. 8-12 Fragen mit Likert-Skala. Scoring-Algorithmus ordnet Nutzer einer von 5 Risikoklassen zu (sicherheitsorientiert bis spekulativ). Ergebnis beeinflusst alle Rendite-Projektionen und Empfehlungen.
## Abhaengigkeiten

- CMP-9.1.1 (Audit-Logger) protokolliert Risikoprofil-Aenderungen

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Benutzereingaben: Antworten auf 8-12 Likert-Skala-Fragen |
| **Output** | Risikoklasse (1-5: sicherheitsorientiert bis spekulativ) mit Score |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-1.3.1.1](../functions/FN-1.3.1.1_Fragebogen_Anzeigen.md) | Fragebogen Anzeigen | draft |
| [FN-1.3.1.2](../functions/FN-1.3.1.2_Risikoklasse_Berechnen.md) | Risikoklasse Berechnen | draft |
| [FN-1.3.1.3](../functions/FN-1.3.1.3_Profil_Aenderung_Protokollieren.md) | Profil Aenderung Protokollieren | draft |


---

## Constraints

WpHG-konform. Jede Aenderung muss auditiert werden (CMP-9.1.1). Score-Algorithmus muss dokumentiert und reproduzierbar sein.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-1 | Risikoprofil als besonders schutzwuerdige Daten |
| INF-3 | Likert-Skala barrierefrei bedienbar |
