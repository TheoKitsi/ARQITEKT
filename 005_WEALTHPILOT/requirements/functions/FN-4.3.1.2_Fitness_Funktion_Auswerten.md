---
type: function
id: FN-4.3.1.2
status: draft
parent: CMP-4.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.3.1.2: Fitness Funktion Auswerten

> **Parent**: [CMP-4.3.1](../components/CMP-4.3.1_Optimierungs_Algorithmus.md)

---

## Functional Description

Das System muss jedes Szenario mit der Cross-Impact-Engine bewerten. Fitness = gewichteter Score aus: min. Rendite-Verlust (40%), min. Steuerlast (20%), max. Ziel-Erreichung (25%), Liquiditaet (15%).

- Das System soll die Fitness-Funktion deterministisch berechnen.
- Das System soll die Gewichte konfigurierbar halten.
- Das System soll die Fitness auf eine Skala von 0.0 bis 1.0 normalisieren.

---

## Preconditions

- Cross-Impact-Engine kann ein Szenario bewerten.
- Gewichte sind konfiguriert (Standard: 40/20/25/15).

---

## Behavior

1. System dekodiert das Chromosom in eine Umschichtungskonfiguration.
2. System ruft die Cross-Impact-Engine (CMP-4.2.1) fuer das Szenario auf.
3. System extrahiert: Rendite-Delta, Steuerlast, Ziel-Erreichungsgrad, Liquiditaets-Status.
4. System normalisiert jeden Faktor auf [0, 1].
5. System berechnet Fitness = 0.40*(1-Norm_Rendite_Verlust) + 0.20*(1-Norm_Steuer) + 0.25*Norm_Ziel + 0.15*Norm_Liquiditaet.
6. System gibt den Fitness-Wert [0.0, 1.0] zurueck.

---

## Postconditions

- Fitness-Wert [0.0, 1.0] ist fuer das Szenario berechnet.
- Einzel-Faktoren sind nachvollziehbar aufgeschluesselt.

---

## Error Handling

- Das System soll bei fehlender Impact-Berechnung Fitness = 0.0 zurueckgeben.
- Das System soll bei Timeout der Impact-Engine das Szenario als "nicht bewertbar" markieren.

---

## Acceptance Criteria (functional)

- [ ] Szenario mit niedrigem Rendite-Verlust und hoher Ziel-Erreichung erhaelt hohe Fitness (> 0.7).
- [ ] Szenario mit hoher Steuerlast und niedriger Ziel-Erreichung erhaelt niedrige Fitness (< 0.3).
- [ ] Fitness-Wert liegt immer zwischen 0.0 und 1.0.
- [ ] Gewichtsaenderung durch Admin beeinflusst das Ergebnis.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
