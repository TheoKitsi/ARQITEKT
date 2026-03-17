---
type: function
id: FN-7.2.1.1
status: draft
parent: CMP-7.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-7.2.1.1: Matching Score Berechnen

> **Parent**: [CMP-7.2.1](../components/CMP-7.2.1_Produkt_Matching_Engine.md)

---

## Functional Description

Das System muss fuer jedes Produkt einen Matching-Score (0-100) berechnen basierend auf: Risikoklassen-Passung (30%), Kosten/TER (25%), historische Rendite (20%), ESG-Rating (15%), Portfolio-Diversifikation (10%).

- Das System soll den Score normalisiert auf 0-100 berechnen.
- Das System soll die Gewichte konfigurierbar halten.
- Das System soll den Score als Basis fuer die Empfehlungs-Rangfolge nutzen.

---

## Preconditions

- Nutzerprofil (Risikoklasse, Portfolio) ist bekannt.
- Produktdaten (TER, Rendite, Risikoklasse, ESG) sind verfuegbar.

---

## Behavior

1. System laedt das Nutzerprofil: Risikoklasse, aktuelle Asset-Allokation.
2. Pro Produkt: System berechnet Risikoklassen-Passung (0-100): |Produkt-RK - Nutzer-RK| / 6 * 100, invertiert.
3. Pro Produkt: System berechnet Kosten-Score: (max_TER - Produkt_TER) / max_TER * 100.
4. Pro Produkt: System berechnet Rendite-Score: Rendite_5J normalisiert auf 0-100.
5. Pro Produkt: System berechnet ESG-Score: ESG-Rating normalisiert auf 0-100.
6. Pro Produkt: System berechnet Diversifikations-Score: Wie sehr verbessert das Produkt die aktuelle Allokation.
7. System berechnet gewichteten Matching-Score: 0.3*RK + 0.25*Kosten + 0.2*Rendite + 0.15*ESG + 0.1*Diversifikation.
8. System rundet auf Ganzzahl.

---

## Postconditions

- Matching-Score (0-100) ist fuer jedes Produkt berechnet.
- Score ist fuer Ranking und Empfehlung verfuegbar.

---

## Error Handling

- Das System soll bei fehlendem ESG-Rating den ESG-Score neutral (50) setzen.
- Das System soll bei fehlender 5J-Rendite die 3J- oder 1J-Rendite als Fallback verwenden.

---

## Acceptance Criteria (functional)

- [ ] Produkt mit perfekter Risikoklassen-Passung und niedriger TER erhaelt Score > 80.
- [ ] Produkt mit falscher Risikoklasse und hoher TER erhaelt Score < 30.
- [ ] Fehlendes ESG-Rating: Score wird mit neutralem ESG-Wert berechnet.
- [ ] Gewichtsaenderung durch Admin beeinflusst die Scores.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
