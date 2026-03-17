---
type: function
id: FN-1.2.1.4
status: draft
parent: CMP-1.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.2.1.4: DIN77230 Kategorisierung

> **Parent**: [CMP-1.2.1](../components/CMP-1.2.1_Einnahmen_Ausgaben_Modul.md)

---

## Functional Description

Das System muss Einnahmen und Ausgaben gemaess DIN 77230 (Basis-Finanzanalyse) kategorisieren und eine Deckungsluekenanalyse durchfuehren.

- Das System soll die DIN-77230-Bedarfsfelder abbilden: Grundabsicherung, Wohnen, Altersvorsorge, Vermoegenssicherung, Vermoegensaufbau.
- Das System soll automatisch Deckungsluecken identifizieren (Bedarf vs. Ist-Absicherung).
- Das System soll Handlungsempfehlungen pro Bedarfsfeld generieren.

---

## Preconditions

- Einnahmen und Ausgaben sind vollstaendig erfasst.
- Nutzer hat das Risikoprofil (CMP-1.3.1) ausgefuellt.

---

## Behavior

1. System ordnet jede Ausgabe einem DIN-77230-Bedarfsfeld zu (regelbasiertes Mapping).
2. System berechnet den Soll-Bedarf pro Bedarfsfeld basierend auf Einkommen und Risikoprofil.
3. System vergleicht Ist-Absicherung mit Soll-Bedarf.
4. System identifiziert Deckungsluecken (Soll > Ist).
5. System generiert Handlungsempfehlungen: Prioritaet, Massnahme, geschaetzter Betrag.
6. System zeigt die Analyse als strukturierte Uebersicht mit Ampelfarben (gruen/gelb/rot).

---

## Postconditions

- Alle Einnahmen/Ausgaben sind einem DIN-77230-Bedarfsfeld zugeordnet.
- Deckungsluecken sind identifiziert und quantifiziert.
- Handlungsempfehlungen sind priorisiert verfuegbar.

---

## Error Handling

- Das System soll bei unvollstaendigen Einnahmen/Ausgaben eine Warnung "Analyse moeglicherweise unvollstaendig" anzeigen.
- Das System soll bei fehlendem Risikoprofil den Nutzer zur Profil-Erfassung weiterleiten.

---

## Acceptance Criteria (functional)

- [ ] Miete wird dem Bedarfsfeld "Wohnen" zugeordnet.
- [ ] Versicherung wird dem Bedarfsfeld "Grundabsicherung" zugeordnet.
- [ ] Deckungsluecke von 500 EUR im Bereich Altersvorsorge wird rot markiert.
- [ ] Handlungsempfehlung wird mit Prioritaet und geschaetztem Betrag angezeigt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
