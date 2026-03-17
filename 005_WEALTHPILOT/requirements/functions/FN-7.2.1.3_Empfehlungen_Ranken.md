---
type: function
id: FN-7.2.1.3
status: draft
parent: CMP-7.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-7.2.1.3: Empfehlungen Ranken

> **Parent**: [CMP-7.2.1](../components/CMP-7.2.1_Produkt_Matching_Engine.md)

---

## Functional Description

Das System muss die Top-5 Produkte absteigend nach Matching-Score anzeigen mit Begruendung warum dieses Produkt zum Nutzerprofil passt.

- Das System soll nur geeignete Produkte (nach Geeignetheitspruefung) ranken.
- Das System soll pro Empfehlung eine textuelle Begruendung generieren.
- Das System soll die Top-5 als Karten mit Score und Begruendung darstellen.

---

## Preconditions

- Matching-Scores sind berechnet (FN-7.2.1.1).
- Geeignetheitspruefung ist abgeschlossen (FN-7.2.1.2).

---

## Behavior

1. System filtert die Produkte: nur geeignete (Geeignetheitspruefung bestanden).
2. System sortiert nach Matching-Score absteigend.
3. System waehlt die Top-5 aus.
4. Pro Produkt: System generiert eine Begruendung basierend auf den Score-Faktoren: "Dieses Produkt passt weil: Risikoklasse stimmt ueberein, TER ist niedrig (0.2%), gute 5J-Rendite (8.5%)."
5. System zeigt die Top-5 als Empfehlungs-Karten: Produktname, ISIN, Score, Begruendung.
6. System bietet pro Karte: "Details" und "Zum Vergleich".

---

## Postconditions

- Top-5-Empfehlungen sind gerankt und mit Begruendung angezeigt.
- Empfehlungen sind interaktiv (Details, Vergleich).

---

## Error Handling

- Das System soll bei weniger als 5 geeigneten Produkten die vorhandenen anzeigen.
- Das System soll bei 0 geeigneten Produkten die Meldung "Keine passenden Produkte gefunden" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Top-5 sind nach Matching-Score absteigend sortiert.
- [ ] Begruendung nennt konkrete Scores (TER, Rendite, Risikoklasse).
- [ ] Bei nur 3 geeigneten Produkten werden 3 angezeigt.
- [ ] 0 geeignete Produkte: Hinweismeldung.
- [ ] "Details"-Button fuehrt zur Produkt-Detailansicht.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
