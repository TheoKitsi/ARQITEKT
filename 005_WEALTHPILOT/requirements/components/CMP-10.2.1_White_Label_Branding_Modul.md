---
type: component
id: CMP-10.2.1
status: draft
parent: US-10.2
version: "1.0"
date: "2026-03-15"
---

# CMP-10.2.1: White Label Branding Modul

## Beschreibung

Self-Service-Branding fuer Mandanten-Admins. Upload: Logo (SVG/PNG, max 500KB), Favicon, Login-Hintergrundbild. Farb-Editor: Primaer-, Sekundaer- und Akzentfarbe mit automatischer WCAG-AA-Kontrastpruefung. Custom-Texts: Willkommensnachricht, Footer-Text, Impressums-Link, Datenschutz-Link. Live-Preview in Sandbox vor Aktivierung. CSS-Custom-Properties werden bei Mandanten-Login dynamisch injiziert.
## Abhaengigkeiten

- CMP-10.1.1 (Mandanten-Verwaltung) fuer Mandanten-Kontext

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Admin-Uploads: Logo, Favicon, Farben, Texte |
| **Output** | Mandanten-Theme (CSS Custom Properties), Branding-Assets |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-10.2.1.1](../functions/FN-10.2.1.1_Logo_Upload.md) | Logo Upload | draft |
| [FN-10.2.1.2](../functions/FN-10.2.1.2_Farb_Editor.md) | Farb Editor | draft |
| [FN-10.2.1.3](../functions/FN-10.2.1.3_Custom_Texte_Pflegen.md) | Custom Texte Pflegen | draft |
| [FN-10.2.1.4](../functions/FN-10.2.1.4_Live_Preview.md) | Live Preview | draft |


---

## Constraints

WCAG-AA-Kontrastpruefung bei Custom-Farben. SVG/PNG max 500KB. Live-Preview vor Aktivierung. CSS-Injection bei Login.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-3 | WCAG-Kontrastpruefung bei Farbauswahl |
| INF-4 | Custom-Texte ueberschreiben i18n-Defaults |
