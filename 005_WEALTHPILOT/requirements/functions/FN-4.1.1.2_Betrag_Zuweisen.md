---
type: function
id: FN-4.1.1.2
status: draft
parent: CMP-4.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.1.1.2: Betrag Zuweisen

> **Parent**: [CMP-4.1.1](../components/CMP-4.1.1_Umschichtungs_Konfigurator.md)

---

## Functional Description

Das System muss dem Nutzer ermoeglichen, pro Quell-Position einen Teil- oder Gesamtbetrag fuer die Umschichtung zu definieren.

- Das System soll einen Slider und ein numerisches Eingabefeld bereitstellen.
- Das System soll den Betrag als EUR oder als Prozentwert des Positionswerts akzeptieren.
- Das System soll "Alles" als Schnellauswahl-Button anbieten.

---

## Preconditions

- Mindestens eine Quell-Position ist ausgewaehlt (FN-4.1.1.1).
- Aktueller Marktwert der Position ist bekannt.

---

## Behavior

1. Pro ausgewaehlte Position: System zeigt Slider (0% bis 100%) und Eingabefeld.
2. Nutzer waehlt den Betrag per Slider, Eingabefeld oder "Alles"-Button.
3. Bei Prozent-Eingabe: System berechnet den EUR-Betrag.
4. Bei EUR-Eingabe: System berechnet den Prozentwert.
5. System validiert: Betrag > 0 und Betrag <= aktueller Marktwert.
6. System aktualisiert den Gesamtumschichtungsbetrag in Echtzeit.
7. System speichert die Zuweisung im Konfigurator-State.

---

## Postconditions

- Jeder ausgewaehlten Position ist ein Umschichtungsbetrag zugewiesen.
- Gesamtumschichtungsbetrag ist berechnet.
- Betraege sind im Konfigurator-State gespeichert.

---

## Error Handling

- Das System soll bei Betrag > Marktwert die Meldung "Betrag uebersteigt den aktuellen Wert" anzeigen.
- Das System soll bei Betrag = 0 die Meldung "Bitte Betrag eingeben" anzeigen.
- Das System soll bei negativem Betrag die Eingabe ablehnen.

---

## Acceptance Criteria (functional)

- [ ] Slider auf 50% bei 10000 EUR Position zeigt 5000 EUR.
- [ ] "Alles"-Button setzt Betrag auf 100% des Marktwerts.
- [ ] Manuelle EUR-Eingabe von 3000 zeigt 30% bei 10000 EUR Position.
- [ ] Betrag > Marktwert wird abgelehnt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
