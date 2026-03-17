---
type: function
id: FN-4.2.2.3
status: draft
parent: CMP-4.2.2
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.2.2.3: Impact Gauge Anzeigen

> **Parent**: [CMP-4.2.2](../components/CMP-4.2.2_Impact_Visualisierung.md)

---

## Functional Description

Das System muss den Impact-Score als Gauge-Indikator (Tachometer-Stil) anzeigen: rot (-100 bis -30), gelb (-30 bis +30), gruen (+30 bis +100).

- Das System soll Apache ECharts (Gauge-Serie) verwenden.
- Das System soll den numerischen Score im Zentrum des Gauges anzeigen.
- Das System soll die qualitative Einstufung unter dem Gauge als Text anzeigen.

---

## Preconditions

- Impact-Score ist berechnet (FN-4.2.1.4).

---

## Behavior

1. System rendert ein halbkreisfoermiges Gauge-Chart via ECharts.
2. System teilt den Bereich in 3 Farb-Zonen: rot (-100 bis -30), gelb (-30 bis +30), gruen (+30 bis +100).
3. System positioniert die Nadel auf dem aktuellen Score-Wert.
4. System zeigt den numerischen Score im Zentrum (grosse Schrift).
5. System zeigt die qualitative Einstufung (z.B. "negativ") unter dem Gauge.
6. System animiert die Nadel beim ersten Rendern (Sweep-Animation).

---

## Postconditions

- Gauge ist gerendert mit korrekter Nadelposition.
- Farb-Zonen sind korrekt.
- Numerischer Score und qualitative Einstufung sind sichtbar.

---

## Error Handling

- Das System soll bei Score = NaN das Gauge ausblenden und "Berechnung fehlgeschlagen" anzeigen.
- Das System soll bei Rendering-Fehler den Score als grosse Zahl ohne Chart anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Score -50 zeigt Nadel im roten Bereich.
- [ ] Score 0 zeigt Nadel im gelben Bereich.
- [ ] Score +70 zeigt Nadel im gruenen Bereich.
- [ ] Animation laeuft beim ersten Laden.
- [ ] Qualitative Einstufung stimmt mit Score ueberein.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
