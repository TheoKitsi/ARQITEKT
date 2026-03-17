---
type: component
id: CMP-1.1.1
status: draft
parent: US-1.1
version: "1.0"
date: "2026-03-15"
---

# CMP-1.1.1: Konto und Depot Erfassungsformular

## Beschreibung

Multi-Step-Formular zur manuellen Erfassung von Bankkonten, Wertpapierdepots und sonstigen Vermoegensgegenstaenden. Unterstuetzt Validierung von IBAN, BIC und ISIN. Speicherung als verschluesseltes Finanzprofil-Objekt in der Datenbank.
## Abhaengigkeiten

- CMP-2.1.1 (PSD2-Adapter) fuer automatische Kontoerfassung als Alternative

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Benutzereingaben: IBAN, BIC, ISIN, Kontotyp, Wert, Waehrung |
| **Output** | Persistiertes Finanzprofil-Objekt (verschluesselt) |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-1.1.1.1](../functions/FN-1.1.1.1_IBAN_Validierung.md) | IBAN Validierung | draft |
| [FN-1.1.1.2](../functions/FN-1.1.1.2_Depot_Anlegen.md) | Depot Anlegen | draft |
| [FN-1.1.1.3](../functions/FN-1.1.1.3_Vermoegen_Kategorisieren.md) | Vermoegen Kategorisieren | draft |
| [FN-1.1.1.4](../functions/FN-1.1.1.4_Verschluesselte_Speicherung.md) | Verschluesselte Speicherung | draft |


---

## Constraints

Max 50 Konten/Depots pro Nutzer. Formular-State muss Draft-Persistierung unterstuetzen. IBAN-Validierung client- und serverseitig.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-1 | Verschluesselte Speicherung, DSGVO Art. 32 |
| INF-3 | Formular-Barrierefreiheit, Tastatur-Navigation |
