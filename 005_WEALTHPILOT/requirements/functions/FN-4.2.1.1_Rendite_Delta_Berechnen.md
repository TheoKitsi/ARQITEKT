---
type: function
id: FN-4.2.1.1
status: draft
parent: CMP-4.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.2.1.1: Rendite Delta Berechnen

> **Parent**: [CMP-4.2.1](../components/CMP-4.2.1_Cross_Impact_Engine.md)

---

## Functional Description

Das System muss fuer jede betroffene Position die Rendite-Differenz (vorher vs. nachher) berechnen unter Verwendung der historischen Rendite-Daten.

- Das System soll die erwartete Rendite der Quell-Position(en) und der Ziel-Anlage projizieren.
- Das System soll das Delta ueber die konfigurierten Zeitraeume (1, 3, 5, 10 Jahre) berechnen.
- Das System soll positive und negative Deltas farblich unterscheiden.

---

## Preconditions

- Umschichtungskonfiguration ist vollstaendig (CMP-4.1.1).
- Historische Rendite-Daten fuer Quell- und Ziel-Positionen sind verfuegbar.

---

## Behavior

1. System laedt die historische TTWROR der Quell-Position(en).
2. System ermittelt die erwartete Rendite der Ziel-Anlage (historisch oder Benchmark-basiert).
3. Pro Zeitraum (1, 3, 5, 10 Jahre): System projiziert den Quell-Wert = Betrag * (1 + Rendite_Quelle)^Jahre.
4. Pro Zeitraum: System projiziert den Ziel-Wert = Betrag * (1 + Rendite_Ziel)^Jahre.
5. System berechnet Delta_EUR = Ziel-Wert - Quell-Wert.
6. System berechnet Delta_Prozent = (Rendite_Ziel - Rendite_Quelle) in Prozentpunkten.
7. System speichert die Ergebnisse fuer die Impact-Aggregation (FN-4.2.1.4).

---

## Postconditions

- Rendite-Delta ist pro Zeitraum in EUR und Prozentpunkten berechnet.
- Ergebnisse sind fuer die Impact-Aggregation verfuegbar.
- Positive/negative Deltas sind farblich kodiert.

---

## Error Handling

- Das System soll bei fehlenden historischen Daten der Ziel-Anlage Benchmark-Renditen als Proxy verwenden.
- Das System soll bei negativem Ziel-Rendite-Delta eine Warnung "Erwartete Rendite der Ziel-Anlage ist geringer" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Quell-Rendite 8% p.a., Ziel-Rendite 3% p.a., 10000 EUR: nach 5 Jahren Delta = -2893 EUR.
- [ ] Positive Delta wird gruen, negatives rot dargestellt.
- [ ] Alle 4 Zeitraeume (1/3/5/10J) zeigen Werte.
- [ ] Fehlende Ziel-Daten nutzen Benchmark als Proxy.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
