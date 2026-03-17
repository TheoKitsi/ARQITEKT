---
type: function
id: FN-8.1.1.2
status: draft
parent: CMP-8.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-8.1.1.2: Allokations Chart

> **Parent**: [CMP-8.1.1](../components/CMP-8.1.1_Vermoegens_Dashboard_Widget.md)

---

## Functional Description

Das System muss die Asset-Allokation als Donut-Chart darstellen: Segmente nach Asset-Klasse, Prozent und Eurobetraege in Tooltips.

- Das System soll Apache ECharts (Pie-Serie, Donut-Variante) verwenden.
- Das System soll bis zu 8 Segmente anzeigen (kleine Klassen als "Sonstige" zusammenfassen).
- Das System soll bei Hover den EUR-Betrag und Prozentanteil im Tooltip anzeigen.

---

## Preconditions

- Positionen sind Asset-Klassen zugeordnet (FN-1.1.1.3).
- Aktuelle Marktwerte sind verfuegbar.

---

## Behavior

1. System gruppiert alle Positionen nach Asset-Klasse.
2. System berechnet den Marktwert und Prozentanteil pro Klasse.
3. System sortiert nach Anteil absteigend.
4. Klassen mit Anteil < 2% werden zu "Sonstige" zusammengefasst.
5. System rendert den Donut-Chart via ECharts.
6. Bei Hover: Tooltip zeigt "Aktien: EUR 85.000 (36.2%)".
7. Zentrum des Donuts zeigt das Gesamtvermoegen.

---

## Postconditions

- Donut-Chart ist gerendert mit korrekten Segmenten.
- Tooltips zeigen EUR und % pro Segment.

---

## Error Handling

- Das System soll bei nur einer Asset-Klasse einen vollstaendigen Kreis (100%) anzeigen.
- Das System soll bei Rendering-Fehler eine Fallback-Tabelle anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Donut-Chart zeigt Segmente fuer Aktien, Anleihen, Cash etc.
- [ ] Tooltip zeigt EUR-Betrag und Prozent.
- [ ] Kleine Klassen (< 2%) sind als "Sonstige" zusammengefasst.
- [ ] Zentrum zeigt Gesamtvermoegen.
- [ ] ECharts-Donut rendert korrekt auf Desktop und Tablet.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
