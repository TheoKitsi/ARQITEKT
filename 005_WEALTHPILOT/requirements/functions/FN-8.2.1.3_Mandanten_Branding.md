---
type: function
id: FN-8.2.1.3
status: draft
parent: CMP-8.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-8.2.1.3: Mandanten Branding

> **Parent**: [CMP-8.2.1](../components/CMP-8.2.1_Report_Generator.md)

---

## Functional Description

Das System muss das Report-Design an das Mandanten-Branding anpassen: Logo, Primaerfarbe, Sekundaerfarbe, Disclaimer-Text.

- Das System soll das Branding aus der Mandanten-Konfiguration (CMP-10.2.1) laden.
- Das System soll CSS-Variablen fuer Farben verwenden.
- Das System soll den Disclaimer-Text mandantenspezifisch einsetzen.

---

## Preconditions

- Mandanten-Branding ist konfiguriert (CMP-10.2.1).
- Report-Template unterstuetzt CSS-Variablen.

---

## Behavior

1. System laedt das Mandanten-Branding: Logo-URL, Primaerfarbe, Sekundaerfarbe, Disclaimer.
2. System setzt die CSS-Variablen: --primary: Primaerfarbe, --secondary: Sekundaerfarbe.
3. System setzt das Logo in die Kopfzeile.
4. System setzt den Disclaimer-Text in die Fusszeile.
5. System rendert das Template mit den Branding-Einstellungen.

---

## Postconditions

- Report-Design entspricht dem Mandanten-Branding.
- Logo, Farben und Disclaimer sind mandantenspezifisch.

---

## Error Handling

- Das System soll bei fehlendem Mandanten-Branding das Standard-Branding (WealthPilot-Default) verwenden.
- Das System soll bei defektem Logo-URL einen Platzhalter anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Logo des Mandanten erscheint in der Kopfzeile.
- [ ] Primaerfarbe wird fuer Ueberschriften und Tabs verwendet.
- [ ] Disclaimer-Text ist mandantenspezifisch.
- [ ] Fehlendes Branding: Standard-Design wird verwendet.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
