---
type: function
id: FN-4.2.2.2
status: draft
parent: CMP-4.2.2
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.2.2.2: Waterfall Chart Rendern

> **Parent**: [CMP-4.2.2](../components/CMP-4.2.2_Impact_Visualisierung.md)

---

## Functional Description

Das System muss die Rendite-Deltas als Waterfall-Chart darstellen: gruene Balken fuer positive, rote fuer negative Impacts, Summenbalken am Ende.

- Das System soll Apache ECharts (Bar-Serie mit Waterfall-Logik) verwenden.
- Das System soll die einzelnen Impact-Faktoren als Stufen darstellen.
- Das System soll den Summenbalken farblich hervorheben.

---

## Preconditions

- Einzel-Impacts (Rendite, Opportunitaet, Steuer, Liquiditaet) sind berechnet.
- Impact-Score ist aggregiert (FN-4.2.1.4).

---

## Behavior

1. System bereitet Waterfall-Daten vor: Ein Balken pro Impact-Faktor + Summenbalken.
2. Positive Impacts: Gruener Balken nach oben.
3. Negative Impacts: Roter Balken nach unten.
4. System berechnet die kumulative Summe als Endbalken (blau).
5. System rendert das Waterfall-Chart via ECharts.
6. Bei Hover: Tooltip zeigt den einzelnen Impact-Wert und die kumulative Summe.

---

## Postconditions

- Waterfall-Chart ist gerendert mit allen Impact-Faktoren.
- Summenbalken zeigt den Gesamteffekt.
- Farbkodierung (gruen/rot/blau) ist korrekt.

---

## Error Handling

- Das System soll bei nur einem Impact-Faktor das Chart dennoch anzeigen (ein Balken + Summe).
- Das System soll bei Rendering-Fehler ein Fallback als Tabelle anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Rendite-Delta (-500), Steuer (-200), Liquiditaet (+100): Waterfall zeigt 3 Stufen + Summe (-600).
- [ ] Positive Balken sind gruen, negative rot.
- [ ] Summenbalken ist blau.
- [ ] Tooltip zeigt korrekte Werte bei Hover.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
