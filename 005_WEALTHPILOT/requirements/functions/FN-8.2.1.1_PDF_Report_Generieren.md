---
type: function
id: FN-8.2.1.1
status: draft
parent: CMP-8.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: ["NTF-REPORT-READY"]
---

# FN-8.2.1.1: PDF Report Generieren

> **Parent**: [CMP-8.2.1](../components/CMP-8.2.1_Report_Generator.md)

---

## Functional Description

Das System muss einen professionellen PDF-Report via Headless-Browser rendern. Seitenformat A4, Kopfzeile mit Mandanten-Logo, Fusszeile mit Seitenzahl und Disclaimer.

- Das System soll Puppeteer (Headless Chrome) fuer das PDF-Rendering verwenden.
- Das System soll das A4-Layout mit korrekten Raendern (20mm) einhalten.
- Das System soll die Generierung asynchron als Background-Job ausfuehren.

---

## Preconditions

- Report-Daten sind verfuegbar (Szenario, Portfolio, Kennzahlen).
- Mandanten-Branding ist konfiguriert.
- Puppeteer/Chrome ist auf dem Server installiert.

---

## Behavior

1. Nutzer klickt "Report generieren".
2. System startet einen Background-Job (Queue-basiert).
3. System rendert das Report-Template als HTML mit den Daten.
4. System oeffnet Headless Chrome und laedt das HTML.
5. System rendert das PDF mit A4-Format, 20mm Raendern.
6. System fuegt Kopfzeile (Logo, Datum) und Fusszeile (Seitenzahl, Disclaimer) hinzu.
7. System speichert das PDF und benachrichtigt den Nutzer.
8. Nutzer kann das PDF herunterladen.

---

## Postconditions

- PDF-Report ist generiert und gespeichert.
- A4-Format mit korrekten Raendern.
- Kopf- und Fusszeile sind korrekt.
- Nutzer ist benachrichtigt.

---

## Error Handling

- Das System soll bei Rendering-Fehler einen Retry (max 2) durchfuehren.
- Das System soll bei Timeout (> 60s) den Job abbrechen und den Nutzer benachrichtigen.
- Das System soll bei fehlendem Chrome einen Fallback-Hinweis loggen.

---

## Acceptance Criteria (functional)

- [ ] PDF hat A4-Format mit 20mm Raendern.
- [ ] Mandanten-Logo ist in der Kopfzeile.
- [ ] Seitenzahl und Disclaimer sind in der Fusszeile.
- [ ] PDF-Dateigrösse ist <= 10 MB.
- [ ] Generierung dauert <= 10 Sekunden.

---

## Notifications

- PDF-Report ist fertig: In-App-Notification und E-Mail an Nutzer (NTF-REPORT-READY).

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
