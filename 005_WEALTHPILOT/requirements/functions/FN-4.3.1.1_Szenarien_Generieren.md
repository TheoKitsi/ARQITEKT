---
type: function
id: FN-4.3.1.1
status: draft
parent: CMP-4.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.3.1.1: Szenarien Generieren

> **Parent**: [CMP-4.3.1](../components/CMP-4.3.1_Optimierungs_Algorithmus.md)

---

## Functional Description

Das System muss mittels genetischem Algorithmus (Population 100, max 50 Generationen) bis zu 3 optimierte Umschichtungs-Szenarien generieren.

- Das System soll den genetischen Algorithmus (GA) mit konfigurierbaren Parametern implementieren.
- Das System soll als Chromosom die Umschichtungsverteilung kodieren (Betragsanteile pro Quell-Position).
- Das System soll die Top-3-Szenarien basierend auf der Fitness-Funktion (FN-4.3.1.2) auswaehlen.

---

## Preconditions

- Mindestens eine Umschichtungskonfiguration existiert.
- Cross-Impact-Engine (CMP-4.2.1) ist verfuegbar fuer Fitness-Bewertung.

---

## Behavior

1. System erzeugt eine Initialpopulation von 100 zufaelligen Umschichtungsverteilungen.
2. Pro Chromosom: System kodiert die Betragsanteile pro Quell-Position und Ziel.
3. Pro Generation: System bewertet jedes Chromosom mit der Fitness-Funktion (FN-4.3.1.2).
4. System selektiert die besten 50% (Tournament-Selektion).
5. System erzeugt Nachkommen via Crossover (Single-Point) und Mutation (Gauss, sigma=5%).
6. System iteriert bis Generation 50 oder bis Konvergenz (Top-Fitness aendert sich < 0.1% ueber 5 Generationen).
7. System waehlt die Top-3-Chromosomen nach Fitness.
8. System dekodiert die Chromosomen in lesbare Umschichtungs-Szenarien.

---

## Postconditions

- Bis zu 3 optimierte Szenarien sind generiert.
- Jedes Szenario hat einen Fitness-Score und eine Umschichtungsverteilung.
- Szenarien sind fuer den Side-by-Side-Vergleich (FN-4.3.1.3) verfuegbar.

---

## Error Handling

- Das System soll bei Berechnungsdauer > 30 Sekunden einen Progress-Indikator mit Generationszaehler anzeigen.
- Das System soll bei Nicht-Konvergenz die Top-3 nach 50 Generationen zurueckgeben.
- Das System soll bei identischen Top-3 nur die einzigartigen Szenarien anzeigen.

---

## Acceptance Criteria (functional)

- [ ] GA erzeugt 3 unterscheidbare Szenarien innerhalb von 30 Sekunden.
- [ ] Konvergenz stoppt frueh wenn Top-Fitness stabil ist.
- [ ] Top-3-Szenarien haben unterschiedliche Verteilungen.
- [ ] Progress-Indikator zeigt aktuelle Generation.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
