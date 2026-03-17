---
type: function
id: FN-4.2.1.2
status: draft
parent: CMP-4.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.2.1.2: Opportunitaetskosten Projizieren

> **Parent**: [CMP-4.2.1](../components/CMP-4.2.1_Cross_Impact_Engine.md)

---

## Functional Description

Das System muss die entgangenen Ertraege der umgeschichteten Position ueber 1, 3, 5 und 10 Jahre projizieren mit Monte-Carlo-Simulation (1000 Pfade).

- Das System soll eine Monte-Carlo-Simulation mit 1000 Zufallspfaden durchfuehren.
- Das System soll die Ergebnisse als Vertrauensintervall darstellen (P10, P50, P90).
- Das System soll historische Volatilitaet und Rendite fuer die Simulation verwenden.

---

## Preconditions

- Historische Rendite und Volatilitaet der Quell-Position sind berechnet.
- Umschichtungsbetrag ist definiert.

---

## Behavior

1. System laedt die historische mittlere Rendite (mu) und Volatilitaet (sigma) der Quell-Position.
2. System generiert 1000 Simulationspfade mit geometrischer Brownscher Bewegung: dS = mu*S*dt + sigma*S*dW.
3. Pro Pfad und Zeitraum (1/3/5/10J): System berechnet den projizierten Wert.
4. System sortiert die 1000 Endwerte pro Zeitraum.
5. System berechnet P10 (pessimistisch), P50 (median), P90 (optimistisch).
6. System berechnet die Opportunitaetskosten: entgangener Wert = P50 - Umschichtungsbetrag.
7. System speichert die Ergebnisse fuer die Impact-Aggregation.

---

## Postconditions

- Monte-Carlo-Simulation mit 1000 Pfaden ist abgeschlossen.
- P10, P50, P90 Werte sind pro Zeitraum berechnet.
- Opportunitaetskosten sind quantifiziert.

---

## Error Handling

- Das System soll bei fehlender Volatilitaet die Benchmark-Volatilitaet als Proxy verwenden.
- Das System soll bei Berechnungsdauer > 5 Sekunden einen Progress-Indikator anzeigen.
- Das System soll bei negativem mu den Nutzer warnen "Position hat historisch negative Rendite".

---

## Acceptance Criteria (functional)

- [ ] Simulation berechnet 1000 Pfade in unter 5 Sekunden.
- [ ] P10 < P50 < P90 fuer alle Zeitraeume.
- [ ] Opportunitaetskosten werden als EUR-Betrag fuer P50 dargestellt.
- [ ] Vertrauensintervall wird als Fan-Chart visualisiert.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
