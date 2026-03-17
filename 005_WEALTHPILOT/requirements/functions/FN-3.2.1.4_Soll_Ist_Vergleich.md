---
type: function
id: FN-3.2.1.4
status: draft
parent: CMP-3.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.2.1.4: Soll Ist Vergleich

> **Parent**: [CMP-3.2.1](../components/CMP-3.2.1_Portfolio_Aggregator.md)

---

## Functional Description

Das System muss die Ist-Rendite mit der Ziel-Rendite (abgeleitet aus Risikoklasse) vergleichen und die Abweichung in Prozentpunkten und als Ampelfarbe anzeigen.

- Das System soll die Ziel-Rendite aus der Risikoklasse (CMP-1.3.1) ableiten (z.B. konservativ = 3-4% p.a.).
- Das System soll die Abweichung farblich kodieren: gruen (>= Ziel), gelb (-2pp bis Ziel), rot (< -2pp).
- Das System soll den Vergleich pro Zeitraum und Gesamt anzeigen.

---

## Preconditions

- Ist-Rendite (TTWROR) ist berechnet.
- Risikoklasse des Nutzers ist zugeordnet.

---

## Behavior

1. System ermittelt die Ziel-Rendite basierend auf der Risikoklasse des Nutzers.
2. System laedt die Ist-Rendite (TTWROR) fuer den gewaehlten Zeitraum.
3. System berechnet die Abweichung: Delta = Ist - Soll (in Prozentpunkten).
4. System bestimmt die Ampelfarbe: gruen (Delta >= 0), gelb (-2 <= Delta < 0), rot (Delta < -2).
5. System zeigt Soll, Ist, Delta und Ampelfarbe im Dashboard an.

---

## Postconditions

- Soll-Ist-Vergleich ist visuell im Dashboard dargestellt.
- Ampelfarbe gibt sofortige Handlungsorientierung.

---

## Error Handling

- Das System soll bei fehlender Risikoklasse die Meldung "Bitte Risikoprofil ausfuellen" anzeigen.
- Das System soll bei nicht konfigurierten Ziel-Rendite-Mappings einen Fallback von 5% p.a. verwenden.

---

## Acceptance Criteria (functional)

- [ ] Risikoklasse "ausgewogen" mit Ziel 5% und Ist 7% ergibt Delta +2pp (gruen).
- [ ] Ist 4% bei Ziel 5% ergibt Delta -1pp (gelb).
- [ ] Ist 2% bei Ziel 5% ergibt Delta -3pp (rot).
- [ ] Fehlende Risikoklasse zeigt Hinweis zum Ausfuellen.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
