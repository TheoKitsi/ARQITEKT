---
type: function
id: FN-9.2.1.1
status: draft
parent: CMP-9.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: ["NTF-DELETION-REQUEST"]
---

# FN-9.2.1.1: Loeschantrag Erfassen

> **Parent**: [CMP-9.2.1](../components/CMP-9.2.1_DSGVO_Loeschmodul.md)

---

## Functional Description

Das System muss Nutzern ein Self-Service-Formular zur Stellung eines Loeschantrags nach DSGVO Art. 17 bieten. Pflichtfelder: Name, E-Mail, Begruendung.

- Das System soll den Antrag als Ticket mit Status-Workflow verwalten.
- Das System soll eine automatische Eingangsbestaetigung senden.
- Das System soll die 30-Tage-Frist automatisch tracken.

---

## Preconditions

- Nutzer ist authentifiziert.
- Loeschantrag-Formular ist verfuegbar.

---

## Behavior

1. Nutzer oeffnet das Loeschantrag-Formular (Einstellungen > Datenschutz > Daten loeschen).
2. System zeigt Formular: Name (vorausgefuellt), E-Mail (vorausgefuellt), Begruendung (Freitext, Pflicht).
3. Nutzer fuellt die Begruendung aus und klickt "Antrag stellen".
4. System erstellt ein Loeschantrag-Ticket mit Status "eingegangen".
5. System setzt die Frist: heute + 30 Tage.
6. System sendet eine Eingangsbestaetigung per E-Mail mit Ticket-Nummer.
7. System loest die Aufbewahrungspflichten-Pruefung aus (FN-9.2.1.2).

---

## Postconditions

- Loeschantrag ist als Ticket erfasst.
- Eingangsbestaetigung ist gesendet.
- 30-Tage-Frist ist gesetzt.
- Aufbewahrungspflichten-Pruefung ist ausgeloest.

---

## Error Handling

- Das System soll bei fehlender Begruendung das Feld rot markieren.
- Das System soll bei E-Mail-Versandfehler den Antrag trotzdem erfassen und den E-Mail-Versand in die Retry-Queue stellen.
- Das System soll bei doppeltem Antrag (offener Antrag existiert) die Meldung "Es existiert bereits ein offener Antrag" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Antrag wird mit Ticket-Nummer erfasst.
- [ ] Eingangsbestaetigung wird per E-Mail gesendet.
- [ ] 30-Tage-Frist ist korrekt gesetzt.
- [ ] Doppelter Antrag wird erkannt und abgelehnt.
- [ ] Fehlende Begruendung wird validiert.

---

## Notifications

- Eingangsbestaetigung per E-Mail an den Nutzer (NTF-DELETION-REQUEST).

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
