---
type: function
id: FN-8.1.1.4
status: draft
parent: CMP-8.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-8.1.1.4: Quick Stats Karten

> **Parent**: [CMP-8.1.1](../components/CMP-8.1.1_Vermoegens_Dashboard_Widget.md)

---

## Functional Description

Das System muss 4 Kennzahlen-Karten anzeigen: Rendite p.a. (TTWROR), Sparquote (%), naechste Faelligkeit (Festgeld/Anleihe), Risikoprofil-Zusammenfassung.

- Das System soll jede Karte als M3-Card mit Icon, Wert und Label darstellen.
- Das System soll die Karten responsiv in einem 2x2 Grid (Desktop) bzw. vertikal (Mobile) anzeigen.
- Das System soll fehlende Werte als "n/a" darstellen.

---

## Preconditions

- Dashboard ist geladen.
- Kennzahlen sind berechnet oder verfuegbar.

---

## Behavior

1. System laedt die 4 Kennzahlen: TTWROR (FN-3.1.1.1), Sparquote (FN-1.2.1.3), naechste Faelligkeit (aus Depot-Daten), Risikoprofil (FN-1.3.1.2).
2. Pro Kennzahl: System rendert eine M3-Outlined-Card mit Icon, Wert (grosse Schrift) und Label (kleine Schrift).
3. Rendite-Karte: Icon "trending_up", Wert z.B. "7.2% p.a.", Label "Rendite (TTWROR)".
4. Sparquote-Karte: Icon "savings", Wert z.B. "28.5%", Label "Sparquote".
5. Faelligkeits-Karte: Icon "event", Wert z.B. "15.06.2026", Label "Naechste Faelligkeit".
6. Risikoprofil-Karte: Icon "shield", Wert z.B. "Ausgewogen", Label "Risikoprofil".
7. System ordnet die Karten im 2x2 Grid (Desktop) oder vertikal (Mobile).

---

## Postconditions

- 4 Kennzahlen-Karten sind gerendert.
- Layout ist responsiv (2x2 bzw. vertikal).

---

## Error Handling

- Das System soll bei fehlendem Wert (z.B. keine Rendite berechnet) "n/a" anzeigen.
- Das System soll bei keiner Faelligkeit die Karte als "Keine Faelligkeit" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Alle 4 Karten sind sichtbar mit korrekten Werten.
- [ ] Fehlende Rendite zeigt "n/a".
- [ ] Responsive Layout passt sich Mobile an (vertikal).
- [ ] M3-Style (Outlined Cards, 12dp Radius) wird angewendet.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
