---
type: function
id: FN-3.3.1.3
status: draft
parent: CMP-3.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.3.1.3: Outperformance Berechnen

> **Parent**: [CMP-3.3.1](../components/CMP-3.3.1_Benchmark_Vergleichsmodul.md)

---

## Functional Description

Das System muss die Outperformance/Underperformance als Differenz in Prozentpunkten und als absolute Eurobetraege berechnen.

- Das System soll die Outperformance relativ (Prozentpunkte) und absolut (EUR) darstellen.
- Das System soll die Outperformance pro Zeitraum berechnen.
- Das System soll die Outperformance als eigenstaendiges Chart (Bar-Chart) anzeigen koennen.

---

## Preconditions

- Portfolio-Rendite und Benchmark-Rendite sind fuer den gleichen Zeitraum berechnet.
- Anfangskapital des Portfolios ist bekannt.

---

## Behavior

1. System laedt die Portfolio-Rendite (TTWROR) und die Benchmark-Rendite fuer den Zeitraum.
2. System berechnet relative Outperformance: Delta_pp = Portfolio_Rendite - Benchmark_Rendite (Prozentpunkte).
3. System berechnet absolute Outperformance: Delta_EUR = Anfangskapital * (Portfolio_Rendite - Benchmark_Rendite).
4. System klassifiziert: Outperformance (Delta > 0), Underperformance (Delta < 0), Gleichlauf (Delta = 0).
5. System zeigt das Ergebnis mit Farb-Indikator: gruen/rot.

---

## Postconditions

- Outperformance ist relativ und absolut berechnet.
- Ergebnis ist farblich kodiert dargestellt.

---

## Error Handling

- Das System soll bei fehlender Benchmark-Rendite den Vergleich nicht anzeigen und "Benchmark nicht verfuegbar" melden.
- Das System soll bei identischen Zeitraeumen aber unterschiedlichen Datendichten die Ergebnisse trotzdem berechnen (Forward-Fill).

---

## Acceptance Criteria (functional)

- [ ] Portfolio +10%, Benchmark +7%: Outperformance = +3pp (gruen).
- [ ] Portfolio +5%, Benchmark +8%: Underperformance = -3pp (rot).
- [ ] Absolute Outperformance bei 100000 EUR und +3pp = 3000 EUR.
- [ ] Fehlende Benchmark zeigt "nicht verfuegbar".

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
