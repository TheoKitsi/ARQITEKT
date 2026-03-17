---
type: function
id: FN-1.2.1.2
status: draft
parent: CMP-1.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.2.1.2: Ausgaben Erfassen

> **Parent**: [CMP-1.2.1](../components/CMP-1.2.1_Einnahmen_Ausgaben_Modul.md)

---

## Functional Description

Das System muss regelmaessige Ausgaben erfassen: Typ (Miete/Kredit/Versicherung/Sparplan/Sonstige), Betrag, Intervall, optionaler Endzeitpunkt.

- Das System soll die gleiche Formularstruktur wie die Einnahmenerfassung bieten.
- Das System soll Ausgaben mit optionalem Enddatum unterstuetzen (z.B. Kredit laeuft 2030 aus).
- Das System soll die Ausgabe fuer die DIN-77230-Kategorisierung (FN-1.2.1.4) bereitstellen.

---

## Preconditions

- Nutzer ist authentifiziert.
- Einnahmen/Ausgaben-Modul ist geoeffnet.

---

## Behavior

1. Nutzer waehlt den Ausgabetyp aus einer vordefinierten Liste.
2. Nutzer gibt den Betrag ein (Waehrung EUR, positive Dezimalzahl).
3. Nutzer waehlt das Intervall (monatlich, quartalsweise, jaehrlich).
4. Optional: Nutzer gibt Beschreibung, Startdatum und Enddatum ein.
5. System validiert alle Eingaben (Typ gesetzt, Betrag > 0, Intervall gesetzt).
6. Falls Enddatum: System prueft, dass Enddatum nach Startdatum liegt.
7. System speichert die Ausgabe verschluesselt (delegiert an FN-1.1.1.4).
8. System aktualisiert die Sparquoten-Anzeige automatisch.

---

## Postconditions

- Die Ausgabe ist persistent gespeichert.
- Die Sparquoten-Berechnung (FN-1.2.1.3) beruecksichtigt die neue Ausgabe.
- Die DIN-77230-Kategorisierung (FN-1.2.1.4) kann die Ausgabe einordnen.

---

## Error Handling

- Das System soll bei negativem Betrag die Meldung "Betrag muss positiv sein" anzeigen.
- Das System soll bei Enddatum vor Startdatum die Meldung "Enddatum muss nach Startdatum liegen" anzeigen.
- Das System soll bei fehlendem Pflichtfeld das Feld rot markieren.

---

## Acceptance Criteria (functional)

- [ ] Ausgabe mit Typ "Miete", 1200.00 EUR, monatlich wird gespeichert.
- [ ] Ausgabe mit Enddatum 2030-12-31 wird gespeichert und bei Ablauf automatisch deaktiviert.
- [ ] Sparquote wird nach Erfassung automatisch neu berechnet.
- [ ] Enddatum vor Startdatum wird abgelehnt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
