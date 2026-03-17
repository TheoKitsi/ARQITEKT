---
type: function
id: FN-4.2.1.4
status: draft
parent: CMP-4.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.2.1.4: Impact Score Aggregieren

> **Parent**: [CMP-4.2.1](../components/CMP-4.2.1_Cross_Impact_Engine.md)

---

## Functional Description

Das System muss einen aggregierten Impact-Score (-100 bis +100) berechnen. Gewichtung: Rendite-Verlust 40%, Opportunitaetskosten 25%, Steuer 20%, Liquiditaet 15%.

- Das System soll die Einzel-Impacts normalisieren (auf -100 bis +100 Skala).
- Das System soll den gewichteten Score berechnen.
- Das System soll den Score mit einer qualitativen Einstufung versehen (sehr negativ/negativ/neutral/positiv/sehr positiv).

---

## Preconditions

- Rendite-Delta (FN-4.2.1.1), Opportunitaetskosten (FN-4.2.1.2), Steuerlast (FN-4.2.1.3) sind berechnet.
- Liquiditaetsreserve-Status ist bekannt (FN-4.1.1.5).

---

## Behavior

1. System normalisiert jeden Impact-Faktor auf die Skala -100 bis +100.
2. System berechnet gewichteten Score: Score = 0.4*Rendite + 0.25*Opportunitaet + 0.2*Steuer + 0.15*Liquiditaet.
3. System rundet den Score auf eine Ganzzahl.
4. System ordnet qualitative Einstufung zu: -100 bis -60 = sehr negativ, -60 bis -20 = negativ, -20 bis +20 = neutral, +20 bis +60 = positiv, +60 bis +100 = sehr positiv.
5. System speichert den Score und die Einstufung.
6. System stellt den Score fuer die Visualisierung (CMP-4.2.2) und den Optimierer (CMP-4.3.1) bereit.

---

## Postconditions

- Aggregierter Impact-Score (-100 bis +100) ist berechnet.
- Qualitative Einstufung ist zugeordnet.
- Score ist fuer Visualisierung und Optimierung verfuegbar.

---

## Error Handling

- Das System soll bei fehlendem Einzel-Impact den fehlenden Faktor neutral (0) gewichten.
- Das System soll bei Score ausserhalb des Bereichs auf -100 bzw. +100 clampen.

---

## Acceptance Criteria (functional)

- [ ] Rendite -50, Opportunitaet -30, Steuer -40, Liquiditaet 0: Score = 0.4*(-50)+0.25*(-30)+0.2*(-40)+0.15*0 = -35.5 = -36 (negativ).
- [ ] Fehlende Opportunitaetskosten: Faktor wird als 0 eingesetzt.
- [ ] Score = +75 wird als "sehr positiv" eingestuft.
- [ ] Score wird auf Ganzzahl gerundet.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
