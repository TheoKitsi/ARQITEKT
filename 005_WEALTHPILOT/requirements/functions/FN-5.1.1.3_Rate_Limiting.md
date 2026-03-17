---
type: function
id: FN-5.1.1.3
status: draft
parent: CMP-5.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-5.1.1.3: Rate Limiting

> **Parent**: [CMP-5.1.1](../components/CMP-5.1.1_Gemini_Chat_Interface.md)

---

## Functional Description

Das System muss KI-Anfragen auf maximal 20 pro Stunde pro Nutzer begrenzen. Bei Ueberschreitung wird eine freundliche Hinweismeldung angezeigt.

- Das System soll ein Sliding-Window Rate-Limiting implementieren.
- Das System soll den verbleibenden Kontingent im UI anzeigen.
- Das System soll das Rate-Limit pro Mandant konfigurierbar machen.

---

## Preconditions

- Nutzer ist authentifiziert.
- Redis ist verfuegbar fuer Counter-Verwaltung.

---

## Behavior

1. Bei jeder KI-Anfrage: System prueft den Counter im Redis (Sliding-Window: 1 Stunde).
2. Falls Counter < Limit (Standard 20): System inkrementiert Counter und erlaubt die Anfrage.
3. Falls Counter >= Limit: System blockiert die Anfrage und zeigt "Sie haben das Limit von 20 Anfragen pro Stunde erreicht. Bitte versuchen Sie es in X Minuten erneut."
4. System zeigt im Chat-UI den verbleibenden Counter: "X von 20 Anfragen verbleibend".
5. System setzt den Counter automatisch nach Ablauf des Sliding-Windows zurueck.

---

## Postconditions

- Counter ist aktualisiert.
- Bei Limit-Ueberschreitung ist die Anfrage blockiert.
- Nutzer sieht verbleibendes Kontingent.

---

## Error Handling

- Das System soll bei Redis-Ausfall das Rate-Limiting deaktivieren (fail-open) und den Vorfall loggen.
- Das System soll bei Counter-Inkonsistenz den Counter zuruecksetzen.

---

## Acceptance Criteria (functional)

- [ ] 20. Anfrage wird erlaubt, 21. wird blockiert.
- [ ] Nach 60 Minuten ist das Kontingent wieder verfuegbar.
- [ ] UI zeigt "3 von 20 Anfragen verbleibend" korrekt an.
- [ ] Mandant mit konfiguriertem Limit von 50 erlaubt 50 Anfragen.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
