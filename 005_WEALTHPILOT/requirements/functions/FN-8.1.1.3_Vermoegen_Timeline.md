---
type: function
id: FN-8.1.1.3
status: draft
parent: CMP-8.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-8.1.1.3: Vermoegen Timeline

> **Parent**: [CMP-8.1.1](../components/CMP-8.1.1_Vermoegens_Dashboard_Widget.md)

---

## Functional Description

Das System muss die Vermoegensentwicklung als Linien-Chart ueber 30, 90 oder 365 Tage darstellen. Defaultansicht: 90 Tage.

- Das System soll Apache ECharts (Line-Serie) verwenden.
- Das System soll den Bereich unter der Linie als Gradient-Fill darstellen.
- Das System soll Zeitraum-Buttons (30T, 90T, 365T) zur Umschaltung bieten.

---

## Preconditions

- Vermoegenshistorie (Zeitreihe) ist verfuegbar.
- Mindestens 30 Tage Daten existieren.

---

## Behavior

1. System laedt die Vermoegenshistorie fuer den gewaehlten Zeitraum (Standard: 90 Tage).
2. System rendert ein Linien-Chart mit Gradient-Area-Fill via ECharts.
3. X-Achse: Datum (formatiert nach Zeitraum: Tag, Woche, Monat).
4. Y-Achse: Vermoegen in EUR.
5. Nutzer kann Zeitraum per Buttons umschalten: 30T, 90T, 365T.
6. Bei Hover: Tooltip zeigt Datum und exakten Wert.
7. Chart animiert beim Zeitraum-Wechsel.

---

## Postconditions

- Timeline-Chart ist gerendert.
- Zeitraum-Umschaltung funktioniert.

---

## Error Handling

- Das System soll bei weniger als 30 Tagen Daten die verfuegbaren Daten anzeigen und den 30T-Button deaktivieren.
- Das System soll bei fehlenden Tagesdaten eine Interpolation durchfuehren.

---

## Acceptance Criteria (functional)

- [ ] 90-Tage-Ansicht zeigt korrekte Vermoegensentwicklung.
- [ ] Zeitraum-Wechsel auf 365T berechnet die Achsen neu.
- [ ] Gradient-Fill unter der Linie ist sichtbar.
- [ ] Tooltip zeigt exaktes Datum und Betrag.
- [ ] Weniger als 30 Tage: Verfuegbare Daten werden angezeigt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
