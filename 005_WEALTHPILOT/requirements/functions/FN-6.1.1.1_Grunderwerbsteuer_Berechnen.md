---
type: function
id: FN-6.1.1.1
status: draft
parent: CMP-6.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.1.1.1: Grunderwerbsteuer Berechnen

> **Parent**: [CMP-6.1.1](../components/CMP-6.1.1_Nebenkostenrechner.md)

---

## Functional Description

Das System muss die Grunderwerbsteuer anhand des Kaufpreises und des Bundeslandes berechnen. Aktuelle Saetze: Bayern/Sachsen 3.5%, Hamburg 5.5%, NRW/Saarland/Schleswig-Holstein/Brandenburg/Thueringen 6.5%.

- Das System soll alle 16 Bundeslaender mit ihren aktuellen Steuersaetzen abbilden.
- Das System soll die Steuersaetze konfigurierbar halten (Admin-Update bei Gesetzesaenderung).
- Das System soll den berechneten Betrag in der Kostenaufstellung (FN-6.1.1.4) verwenden.

---

## Preconditions

- Kaufpreis ist eingegeben.
- Bundesland ist ausgewaehlt.

---

## Behavior

1. Nutzer gibt den Kaufpreis ein (EUR, > 0).
2. Nutzer waehlt das Bundesland aus einer Dropdown-Liste.
3. System laedt den aktuellen Steuersatz fuer das Bundesland.
4. System berechnet: Grunderwerbsteuer = Kaufpreis * Steuersatz.
5. System zeigt den berechneten Betrag mit Steuersatz an.
6. System aktualisiert die Gesamtkostenaufstellung (FN-6.1.1.4) automatisch.

---

## Postconditions

- Grunderwerbsteuer ist berechnet und angezeigt.
- Wert ist fuer die Gesamtkostenaufstellung verfuegbar.

---

## Error Handling

- Das System soll bei fehlendem Bundesland die Berechnung verhindern und "Bitte Bundesland waehlen" anzeigen.
- Das System soll bei Kaufpreis <= 0 die Meldung "Bitte gueltigen Kaufpreis eingeben" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Kaufpreis 300000 EUR, Bayern (3.5%): Grunderwerbsteuer = 10500 EUR.
- [ ] Kaufpreis 300000 EUR, NRW (6.5%): Grunderwerbsteuer = 19500 EUR.
- [ ] Aenderung des Bundeslandes berechnet sofort neu.
- [ ] Admin kann Steuersatz aendern und neue Berechnung ist korrekt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
