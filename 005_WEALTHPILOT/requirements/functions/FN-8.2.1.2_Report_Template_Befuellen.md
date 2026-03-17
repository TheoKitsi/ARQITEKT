---
type: function
id: FN-8.2.1.2
status: draft
parent: CMP-8.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-8.2.1.2: Report Template Befuellen

> **Parent**: [CMP-8.2.1](../components/CMP-8.2.1_Report_Generator.md)

---

## Functional Description

Das System muss das Report-Template mit Daten befuellen: Executive Summary, Ausgangslage (Portfolio-Snapshot), Szenarien-Analyse, Empfehlungen, Appendix.

- Das System soll ein HTML/Handlebars-Template verwenden.
- Das System soll alle Charts als statische Bilder (PNG) einbetten.
- Das System soll die Sections dynamisch ein-/ausblenden (je nach verfuegbaren Daten).

---

## Preconditions

- Report-Template existiert.
- Report-Daten sind gesammelt.

---

## Behavior

1. System laedt das Handlebars-Template.
2. System befuellt die Sections: Executive Summary (Zusammenfassung), Portfolio-Snapshot (Tabelle + Chart), Szenarien-Analyse (Impact-Details), Empfehlungen (Top-3-Produkte), Appendix (Berechnungsgrundlagen).
3. System rendert alle Charts als statische PNGs (ECharts Server-Side-Rendering).
4. System bindet die PNGs als Base64-Images in das HTML ein.
5. System entfernt Sections ohne Daten (z.B. keine Szenarien-Analyse wenn kein Szenario berechnet).
6. System gibt das befuellte HTML an den PDF-Renderer zurueck.

---

## Postconditions

- Report-HTML ist vollstaendig befuellt.
- Charts sind als PNGs eingebettet.
- Leere Sections sind ausgeblendet.

---

## Error Handling

- Das System soll bei fehlendem Template einen Fehler loggen und den Report-Job abbrechen.
- Das System soll bei fehlendem Chart-PNG einen Platzhalter "Chart nicht verfuegbar" einsetzen.

---

## Acceptance Criteria (functional)

- [ ] Template ist mit allen verfuegbaren Daten befuellt.
- [ ] Charts erscheinen als Bilder im Report.
- [ ] Section ohne Daten wird nicht angezeigt.
- [ ] HTML ist valide und von Puppeteer renderbar.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
