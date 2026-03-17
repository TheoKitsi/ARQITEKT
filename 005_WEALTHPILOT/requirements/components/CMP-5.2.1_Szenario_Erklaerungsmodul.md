---
type: component
id: CMP-5.2.1
status: draft
parent: US-5.2
version: "1.0"
date: "2026-03-15"
---

# CMP-5.2.1: Szenario Erklaerungsmodul

## Beschreibung

Nimmt ein berechnetes Impact-Szenario und generiert eine strukturierte natuerlichsprachliche Erklaerung. Prompt-Template validiert KI-Zahlen gegen berechnete Werte: bei Abweichung > 2% wird die KI-Aussage verworfen und durch berechneten Wert ersetzt. Output: Zusammenfassung, Risiken, Chancen, Naechste Schritte.
## Abhaengigkeiten

- CMP-4.2.1 (Cross-Impact-Engine) fuer die validierbaren Berechnungsdaten
- CMP-5.1.1 (Gemini Chat) fuer die NLG-Pipeline

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Berechnetes Impact-Szenario, Structured-Output-Template |
| **Output** | Natuerlichsprachliche Erklaerung: Zusammenfassung, Risiken, Chancen, Naechste Schritte |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-5.2.1.1](../functions/FN-5.2.1.1_Impact_Erklaerung_Generieren.md) | Impact Erklaerung Generieren | draft |
| [FN-5.2.1.2](../functions/FN-5.2.1.2_Zahlen_Validieren.md) | Zahlen Validieren | draft |
| [FN-5.2.1.3](../functions/FN-5.2.1.3_Risiken_Identifizieren.md) | Risiken Identifizieren | draft |
| [FN-5.2.1.4](../functions/FN-5.2.1.4_Naechste_Schritte_Vorschlagen.md) | Naechste Schritte Vorschlagen | draft |


---

## Constraints

Zahlen-Validierung: KI-Zahlen gegen berechnete Werte, Schwelle 2%. Bei Abweichung: berechneter Wert statt KI-Wert.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-2 | Output-Validierung gegen Berechnungsdaten |
| INF-4 | Erklaerung in Profilsprache des Nutzers |
