---
type: function
id: FN-5.1.1.4
status: draft
parent: CMP-5.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-5.1.1.4: Disclaimer Anzeigen

> **Parent**: [CMP-5.1.1](../components/CMP-5.1.1_Gemini_Chat_Interface.md)

---

## Functional Description

Das System muss unter jeder KI-Antwort einen Disclaimer anzeigen: "Keine Anlageberatung im Sinne des WpHG. Automatisch generierter Inhalt — bitte verifizieren."

- Das System soll den Disclaimer als nicht-entfernbare Fusszeile unter jeder KI-Antwort anzeigen.
- Das System soll den Disclaimer-Text mandantenspezifisch konfigurierbar machen.
- Das System soll den Disclaimer visuell dezent aber lesbar darstellen (kleinere Schrift, grau).

---

## Preconditions

- Eine KI-Antwort wurde generiert.

---

## Behavior

1. System laedt den mandantenspezifischen Disclaimer-Text (oder Standard-Text).
2. System fuegt den Disclaimer als Fusszeile unter die KI-Antwort ein.
3. System rendert den Disclaimer in kleinerer Schrift (12px) und grauer Farbe.
4. Disclaimer ist nicht klickbar und nicht entfernbar.
5. Bei Export (PDF): Disclaimer wird ebenfalls inkludiert.

---

## Postconditions

- Disclaimer ist unter der KI-Antwort sichtbar.
- Disclaimer-Text entspricht der Mandanten-Konfiguration.

---

## Error Handling

- Das System soll bei fehlendem Mandanten-Disclaimer den Standard-Text verwenden.
- Das System soll bei Rendering-Fehler den Disclaimer als Plain-Text anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Standard-Disclaimer ist unter jeder KI-Antwort sichtbar.
- [ ] Mandanten-spezifischer Disclaimer wird korrekt angezeigt.
- [ ] Disclaimer ist visuell dezent (klein, grau).
- [ ] Disclaimer erscheint auch im PDF-Export.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
