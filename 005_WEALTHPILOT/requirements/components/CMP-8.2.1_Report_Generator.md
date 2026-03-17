---
type: component
id: CMP-8.2.1
status: draft
parent: US-8.2
version: "1.0"
date: "2026-03-15"
---

# CMP-8.2.1: Report Generator

## Beschreibung

Generiert professionelle PDF-Reports via Headless-Browser (Puppeteer/Playwright). Template-Engine mit Mandanten-Branding (Logo, Farben, Disclaimer). Inhalte: Executive Summary, Ausgangslage, Szenario-Vergleich (bis zu 3 Szenarien), Empfehlung, Anhang mit Rohdaten. Zusaetzlich: Excel-Export (XLSX) mit allen Berechnungsdaten fuer eigene Analyse.
## Abhaengigkeiten

- CMP-4.2.2 (Impact-Visualisierung) fuer Chart-Rendering
- CMP-10.2.1 (Branding-Modul) fuer Mandanten-Styling

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Szenario-Daten, Mandanten-Branding, Report-Template |
| **Output** | PDF-Report (A4) und XLSX-Export |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-8.2.1.1](../functions/FN-8.2.1.1_PDF_Report_Generieren.md) | PDF Report Generieren | draft |
| [FN-8.2.1.2](../functions/FN-8.2.1.2_Report_Template_Befuellen.md) | Report Template Befuellen | draft |
| [FN-8.2.1.3](../functions/FN-8.2.1.3_Mandanten_Branding.md) | Mandanten Branding | draft |
| [FN-8.2.1.4](../functions/FN-8.2.1.4_Excel_Export.md) | Excel Export | draft |


---

## Constraints

Headless-Browser (Puppeteer/Playwright) fuer PDF. Max 10s Generierungszeit. Mandanten-Logo und Farben. XLSX mit Rohdaten.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-5 | PDF < 10s, parallel bis 10 Reports |
| INF-7 | Headless-Browser als CI-Dependency |
