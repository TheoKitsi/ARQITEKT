---
type: function
id: FN-8.1.1.1
status: draft
parent: CMP-8.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-8.1.1.1: Gesamtvermoegen Anzeigen

> **Parent**: [CMP-8.1.1](../components/CMP-8.1.1_Vermoegens_Dashboard_Widget.md)

---

## Functional Description

Das System muss das Gesamtvermoegen als prominente Zahl mit Trend-Indikator (Pfeil hoch/runter + prozentuale Aenderung zum Vormonat) anzeigen.

- Das System soll das Gesamtvermoegen ueber alle Konten und Depots aggregieren.
- Das System soll den Trend zum Vormonat berechnen und farblich darstellen.
- Das System soll das Vermoegen in der Nutzer-Waehrung (Standard: EUR) anzeigen.

---

## Preconditions

- Mindestens ein Konto oder Depot ist erfasst.
- Aktuelle Marktwerte sind verfuegbar.

---

## Behavior

1. System aggregiert alle Kontosalden und Depot-Marktwerte.
2. System berechnet das Gesamtvermoegen: Summe(alle Assets).
3. System laedt den Gesamtwert des Vormonats.
4. System berechnet den Trend: (Aktuell - Vormonat) / Vormonat * 100.
5. System zeigt das Gesamtvermoegen als grosse Zahl (z.B. "EUR 234.567,89").
6. System zeigt den Trend-Indikator: gruener Pfeil hoch (+2.3%) oder roter Pfeil runter (-1.1%).

---

## Postconditions

- Gesamtvermoegen ist als prominente Zahl sichtbar.
- Trend-Indikator zeigt die Veraenderung zum Vormonat.

---

## Error Handling

- Das System soll bei fehlendem Vormonatswert den Trend als "n/a" anzeigen.
- Das System soll bei Aggregationsfehler den letzten bekannten Wert anzeigen und "Stand: {Datum}" hinzufuegen.

---

## Acceptance Criteria (functional)

- [ ] Gesamtvermoegen wird korrekt ueber alle Assets aggregiert.
- [ ] Trend +2.3% zeigt gruenen Pfeil hoch.
- [ ] Trend -1.1% zeigt roten Pfeil runter.
- [ ] Fehlender Vormonatswert: Trend "n/a".
- [ ] Zahl wird mit Tausender-Trennzeichen und 2 Dezimalstellen formatiert.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
