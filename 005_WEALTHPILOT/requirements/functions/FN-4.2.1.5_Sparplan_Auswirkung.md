---
type: function
id: FN-4.2.1.5
status: draft
parent: CMP-4.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.2.1.5: Sparplan Auswirkung

> **Parent**: [CMP-4.2.1](../components/CMP-4.2.1_Cross_Impact_Engine.md)

---

## Functional Description

Das System muss pruefen ob laufende Sparplaene durch die Umschichtung betroffen sind und den Impact auf die langfristige Vermoegensentwicklung berechnen.

- Das System soll alle aktiven Sparplaene des Nutzers laden.
- Das System soll pruefen ob eine Quell-Position Ziel eines Sparplans ist.
- Das System soll den Langfrist-Impact einer Sparplan-Unterbrechung berechnen.

---

## Preconditions

- Umschichtungskonfiguration ist definiert.
- Sparplan-Daten sind verfuegbar.

---

## Behavior

1. System laedt alle aktiven Sparplaene des Nutzers.
2. System prueft ob eine Quell-Position gleichzeitig Ziel eines Sparplans ist.
3. Bei Treffer: System berechnet den Impact einer Sparplan-Unterbrechung ueber 1/3/5/10 Jahre.
4. System nutzt den Zinseszins-Effekt: Entgangener_Wert = Sparrate * ((1+r)^n - 1) / r.
5. System zeigt Warnung: "Sparplan auf Position X ist betroffen" mit berechnetem Langfrist-Impact.
6. System fliessst den Sparplan-Impact in den Gesamt-Impact-Score ein.

---

## Postconditions

- Sparplan-Betroffenheit ist geprueft.
- Langfrist-Impact ist berechnet (falls betroffen).
- Warnung ist angezeigt (falls betroffen).

---

## Error Handling

- Das System soll bei fehlenden Sparplan-Daten den Sparplan-Check ueberspringen und den Impact-Faktor neutral setzen.
- Das System soll bei Sparplan auf nicht-betroffene Position keine Warnung anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Sparplan auf MSCI World ETF: Bei Umschichtung dieser Position wird Warnung angezeigt.
- [ ] Sparrate 200 EUR/Monat, 7% Rendite, 10 Jahre: Entgangener Wert ca. 34.600 EUR.
- [ ] Sparplan auf andere Position: Keine Warnung.
- [ ] Fehlende Sparplan-Daten: Kein Fehler, neutraler Impact.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
