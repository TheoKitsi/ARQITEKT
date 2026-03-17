---
type: function
id: FN-4.1.1.1
status: draft
parent: CMP-4.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.1.1.1: Quell Positionen Waehlen

> **Parent**: [CMP-4.1.1](../components/CMP-4.1.1_Umschichtungs_Konfigurator.md)

---

## Functional Description

Das System muss alle verfuegbaren Positionen des Nutzers als Quelloptionen anzeigen. Gesperrte Positionen werden ausgegraut. Jede Position zeigt: Name, ISIN, Stueckzahl, aktueller Wert, unrealisierter Gewinn/Verlust.

- Das System soll Positionen nach Depot gruppiert darstellen.
- Das System soll gesperrte Positionen (z.B. Sperrfrist) nicht auswaehlbar machen.
- Das System soll eine Mehrfachauswahl ermoeglichen.

---

## Preconditions

- Nutzer ist authentifiziert.
- Mindestens eine aktive Depot-Position existiert.
- Umschichtungs-Konfigurator ist geoeffnet.

---

## Behavior

1. System laedt alle aktiven Positionen des Nutzers aus allen Depots.
2. System gruppiert Positionen nach Depot.
3. Pro Position: System zeigt Name, ISIN, Stueckzahl, aktueller Marktwert, unrealisierter G/V.
4. Gesperrte Positionen (Sperrfrist aktiv) werden ausgegraut und sind nicht klickbar.
5. Nutzer waehlt eine oder mehrere Positionen per Checkbox.
6. System berechnet den verfuegbaren Gesamtbetrag der gewaehlten Positionen.
7. Auswahl wird im Session-State des Konfigurators gespeichert.

---

## Postconditions

- Mindestens eine Quell-Position ist ausgewaehlt.
- Verfuegbarer Gesamtbetrag ist berechnet.
- Auswahl ist im Konfigurator-State gespeichert.

---

## Error Handling

- Das System soll bei keinen verfuegbaren Positionen die Meldung "Keine Positionen verfuegbar" anzeigen.
- Das System soll bei ausschliesslich gesperrten Positionen die Meldung "Alle Positionen sind derzeit gesperrt" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Positionen aus 2 Depots werden korrekt gruppiert angezeigt.
- [ ] Gesperrte Position ist ausgegraut und nicht klickbar.
- [ ] Mehrfachauswahl berechnet den kumulierten Gesamtbetrag.
- [ ] Unrealisierter G/V wird korrekt angezeigt (positiv gruen, negativ rot).

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
