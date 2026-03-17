---
type: function
id: FN-4.2.2.4
status: draft
parent: CMP-4.2.2
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.2.2.4: Vergleichs Timeline

> **Parent**: [CMP-4.2.2](../components/CMP-4.2.2_Impact_Visualisierung.md)

---

## Functional Description

Das System muss zwei Vermoegens-Verlaeufe ueberlagert anzeigen: (1) ohne Umschichtung, (2) mit Umschichtung, ueber die naechsten 1-10 Jahre.

- Das System soll Apache ECharts (Line-Serie) mit zwei Linien verwenden.
- Das System soll den Differenzbereich zwischen den Linien farblich hervorheben (gruen wenn mit > ohne, rot wenn mit < ohne).
- Das System soll interaktive Zeitraum-Auswahl (1/3/5/10 Jahre) ermoeglichen.

---

## Preconditions

- Monte-Carlo-Projektion (FN-4.2.1.2) fuer beide Szenarien ist abgeschlossen.
- Steuerlast ist berechnet (FN-4.2.1.3).

---

## Behavior

1. System berechnet den projizierten Vermoegensverlauf ohne Umschichtung (Status Quo).
2. System berechnet den projizierten Verlauf mit Umschichtung (unter Beruecksichtigung von Steuer und neuer Allokation).
3. System rendert beide Linien ueberlagert via ECharts.
4. System faerbt den Bereich zwischen den Linien: gruen (mit > ohne), rot (mit < ohne).
5. Nutzer kann den Zeitraum per Buttons (1/3/5/10J) umschalten.
6. Bei Hover: Tooltip zeigt beide Werte und die Differenz.

---

## Postconditions

- Zwei Vermoegensverlauf-Linien sind gerendert.
- Differenzbereich ist farblich hervorgehoben.
- Zeitraum-Umschaltung funktioniert.

---

## Error Handling

- Das System soll bei fehlender Projektion die Meldung "Projektion nicht verfuegbar" anzeigen.
- Das System soll bei Zeitraum-Umschaltung das Chart smooth animieren (kein Flackern).

---

## Acceptance Criteria (functional)

- [ ] Linie "ohne Umschichtung" und "mit Umschichtung" sind unterscheidbar.
- [ ] Gruener Bereich zeigt wo Umschichtung vorteilhaft ist.
- [ ] Roter Bereich zeigt wo Umschichtung nachteilig ist.
- [ ] Zeitraum-Wechsel von 5J auf 10J animiert smooth.
- [ ] Tooltip zeigt beide Werte und Delta.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
