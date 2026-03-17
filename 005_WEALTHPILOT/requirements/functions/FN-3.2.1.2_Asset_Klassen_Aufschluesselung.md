---
type: function
id: FN-3.2.1.2
status: draft
parent: CMP-3.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.2.1.2: Asset Klassen Aufschluesselung

> **Parent**: [CMP-3.2.1](../components/CMP-3.2.1_Portfolio_Aggregator.md)

---

## Functional Description

Das System muss die Rendite nach Asset-Klasse (Aktien, Anleihen, Immobilien, Cash, Sonstige) getrennt ausweisen.

- Das System soll die Kategorisierung aus FN-1.1.1.3 verwenden.
- Das System soll die gewichtete Rendite pro Asset-Klasse berechnen.
- Das System soll die Aufschluesselung als sortierte Tabelle und optional als Chart anzeigen.

---

## Preconditions

- Alle Positionen sind einer Asset-Klasse zugeordnet (FN-1.1.1.3).
- Renditen der Einzelpositionen sind berechnet.

---

## Behavior

1. System gruppiert alle Positionen nach Asset-Klasse.
2. Pro Asset-Klasse: System berechnet die gewichtete Rendite (analog FN-3.2.1.1).
3. Pro Asset-Klasse: System berechnet den Kapitalanteil am Gesamtportfolio.
4. System sortiert die Asset-Klassen nach Kapitalanteil absteigend.
5. System zeigt eine Tabelle: Asset-Klasse, Anteil (%), Rendite (%), Marktwert (EUR).

---

## Postconditions

- Rendite pro Asset-Klasse ist berechnet.
- Tabelle ist sortiert und vollstaendig.
- Summe aller Anteile ergibt 100%.

---

## Error Handling

- Das System soll bei nicht zugeordneter Position die Klasse "Sonstige" verwenden.
- Das System soll bei leerer Asset-Klasse (0 Positionen) diese aus der Tabelle ausblenden.

---

## Acceptance Criteria (functional)

- [ ] Aktien (60%, +12%), Anleihen (30%, +3%), Cash (10%, +0.5%) werden korrekt aufgeschluesselt.
- [ ] Summe der Anteile ergibt 100%.
- [ ] Nicht zugeordnete Positionen erscheinen unter "Sonstige".
- [ ] Leere Asset-Klassen werden ausgeblendet.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
