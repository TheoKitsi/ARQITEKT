---
type: function
id: FN-1.2.1.1
status: draft
parent: CMP-1.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.2.1.1: Einnahmen Erfassen

> **Parent**: [CMP-1.2.1](../components/CMP-1.2.1_Einnahmen_Ausgaben_Modul.md)

---

## Functional Description

Das System muss regelmaessige Einnahmen erfassen: Typ (Gehalt/Mieteinnahmen/Dividenden/Sonstige), Betrag, Intervall (monatlich/quartalsweise/jaehrlich).

- Das System soll ein Formular mit strukturierter Eingabe bereitstellen.
- Das System soll Betraege nur als positive Dezimalzahlen mit max. 2 Nachkommastellen akzeptieren.
- Das System soll erfasste Einnahmen fuer die Sparquoten-Berechnung (FN-1.2.1.3) bereitstellen.

---

## Preconditions

- Nutzer ist authentifiziert.
- Einnahmen/Ausgaben-Modul ist geoeffnet.

---

## Behavior

1. Nutzer waehlt den Einnahmetyp aus einer vordefinierten Liste.
2. Nutzer gibt den Betrag ein (Waehrung EUR, positive Dezimalzahl).
3. Nutzer waehlt das Intervall (monatlich, quartalsweise, jaehrlich).
4. Optional: Nutzer gibt eine Beschreibung und ein Startdatum ein.
5. System validiert alle Eingaben (Typ gesetzt, Betrag > 0, Intervall gesetzt).
6. System speichert die Einnahme verschluesselt (delegiert an FN-1.1.1.4).
7. System aktualisiert die Sparquoten-Anzeige automatisch.

---

## Postconditions

- Die Einnahme ist persistent gespeichert.
- Die Sparquoten-Berechnung (FN-1.2.1.3) beruecksichtigt die neue Einnahme.
- Die Einnahme erscheint in der Einnahmen-Liste.

---

## Error Handling

- Das System soll bei negativem Betrag die Meldung "Betrag muss positiv sein" anzeigen.
- Das System soll bei Betrag = 0 die Meldung "Betrag darf nicht null sein" anzeigen.
- Das System soll bei fehlendem Typ das Feld rot markieren.

---

## Acceptance Criteria (functional)

- [ ] Einnahme mit Typ "Gehalt", 3500.00 EUR, monatlich wird gespeichert.
- [ ] Negativer Betrag (-100) wird mit Fehlermeldung abgelehnt.
- [ ] Sparquote wird nach Erfassung automatisch neu berechnet.
- [ ] Einnahme erscheint in der Liste mit korrektem Typ und Betrag.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
