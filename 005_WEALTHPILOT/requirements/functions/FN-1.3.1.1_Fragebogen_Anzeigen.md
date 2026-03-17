---
type: function
id: FN-1.3.1.1
status: draft
parent: CMP-1.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.3.1.1: Fragebogen Anzeigen

> **Parent**: [CMP-1.3.1](../components/CMP-1.3.1_Risikoprofil_Fragebogen.md)

---

## Functional Description

Das System muss einen WpHG-konformen Fragebogen mit 8-12 Fragen (Likert-Skala 1-5) anzeigen. Fragen decken ab: Anlageerfahrung, Anlagehorizont, Verlusttoleranz, Einkommenssituation.

- Das System soll den Fragebogen als Stepper-Formular (eine Frage pro Seite) darstellen.
- Das System soll den Fortschritt als Progress-Bar anzeigen.
- Das System soll ein Zwischenspeichern ermoeglichen (Nutzer kann spaeter fortfahren).

---

## Preconditions

- Nutzer ist authentifiziert.
- Fragebogen-Template ist konfiguriert (mandantenspezifisch moeglich).

---

## Behavior

1. System laedt den Fragebogen-Template fuer den aktuellen Mandanten.
2. System prueft ob ein Zwischenstand existiert und laed diesen ggf.
3. System zeigt die erste (oder naechste unbeantwortete) Frage an.
4. Nutzer beantwortet die Frage per Likert-Skala (1-5) Radio-Buttons.
5. Bei Klick auf "Weiter": System speichert die Antwort und zeigt die naechste Frage.
6. Bei Klick auf "Zurueck": System zeigt die vorherige Frage mit gespeicherter Antwort.
7. Nach der letzten Frage: System zeigt eine Zusammenfassung aller Antworten.
8. Nutzer bestaetigt die Antworten und loest die Risikoklassen-Berechnung aus (FN-1.3.1.2).

---

## Postconditions

- Alle Fragen sind beantwortet und gespeichert.
- Der Fragebogen-Status ist "abgeschlossen".
- Die Risikoklassen-Berechnung (FN-1.3.1.2) wurde ausgeloest.

---

## Error Handling

- Das System soll bei fehlender Antwort den "Weiter"-Button deaktivieren.
- Das System soll bei Verbindungsabbruch den letzten Zwischenstand beibehalten.
- Das System soll bei fehlendem Fragebogen-Template einen 500-Fehler loggen und "Fragebogen nicht verfuegbar" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Fragebogen zeigt 10 Fragen als Stepper mit Progress-Bar.
- [ ] Zwischenspeichern funktioniert — Nutzer kann Browser schliessen und spaeter fortfahren.
- [ ] Zurueck-Navigation zeigt vorherige Antworten korrekt.
- [ ] Zusammenfassung zeigt alle 10 Antworten vor der finalen Bestaetigung.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
