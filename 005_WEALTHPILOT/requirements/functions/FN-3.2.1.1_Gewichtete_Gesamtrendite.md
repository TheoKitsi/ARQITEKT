---
type: function
id: FN-3.2.1.1
status: draft
parent: CMP-3.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.2.1.1: Gewichtete Gesamtrendite

> **Parent**: [CMP-3.2.1](../components/CMP-3.2.1_Portfolio_Aggregator.md)

---

## Functional Description

Das System muss die kapitalgewichtete Gesamtrendite ueber alle Positionen und Depots berechnen.

- Das System soll jede Positionsrendite mit ihrem Kapitalanteil am Gesamtportfolio gewichten.
- Das System soll depotuebergreifend aggregieren.
- Das System soll die Gesamtrendite fuer die gleichen Zeitraeume wie Einzelrenditen berechnen (1M, 3M, 6M, 1J, 3J, YTD, Gesamt).

---

## Preconditions

- Mindestens zwei Positionen mit berechneten Renditen existieren.
- Aktuelle Marktwerte aller Positionen sind verfuegbar.

---

## Behavior

1. System laedt alle Positionen mit ihren aktuellen Marktwerten.
2. System berechnet den Kapitalanteil jeder Position: Gewicht_i = Marktwert_i / Gesamtmarktwert.
3. System laedt die TTWROR jeder Position fuer den gewuenschten Zeitraum.
4. System berechnet die gewichtete Gesamtrendite: R_gesamt = Summe(Gewicht_i * TTWROR_i).
5. System zeigt die Gesamtrendite prominent im Dashboard an.

---

## Postconditions

- Gewichtete Gesamtrendite ist berechnet und im Dashboard sichtbar.
- Einzelgewichte sind nachvollziehbar (Drill-Down moeglich).

---

## Error Handling

- Das System soll bei fehlendem Marktwert einer Position diese aus der Gewichtung ausschliessen und eine Warnung anzeigen.
- Das System soll bei nur einer Position die Einzelrendite als Gesamtrendite verwenden.

---

## Acceptance Criteria (functional)

- [ ] Portfolio mit 60% Position A (+10%) und 40% Position B (+5%) ergibt Gesamtrendite 8%.
- [ ] Depotuebergreifende Berechnung funktioniert korrekt.
- [ ] Fehlender Marktwert schliesst Position aus mit Warnung.
- [ ] Zeitraum-Umschaltung (1M/3M/1J) berechnet korrekte Gesamtrendite.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
