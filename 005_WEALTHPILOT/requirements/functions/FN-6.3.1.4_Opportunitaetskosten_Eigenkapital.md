---
type: function
id: FN-6.3.1.4
status: draft
parent: CMP-6.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.3.1.4: Opportunitaetskosten Eigenkapital

> **Parent**: [CMP-6.3.1](../components/CMP-6.3.1_Miet_Kauf_Vergleichsmodul.md)

---

## Functional Description

Das System muss die Opportunitaetskosten des gebundenen Eigenkapitals berechnen: Entgangene Rendite wenn das EK stattdessen am Kapitalmarkt angelegt worden waere.

- Das System soll die alternative Rendite konfigurierbar machen (Standard: 6% p.a., MSCI World Durchschnitt).
- Das System soll den Zinseszins-Effekt beruecksichtigen.
- Das System soll die entgangene Rendite als Kosten im Miet-Kauf-Vergleich einfliessen lassen.

---

## Preconditions

- Eigenkapitaleinsatz ist bekannt (Kaufpreis - Darlehenssumme + Nebenkosten).
- Alternative Rendite ist konfiguriert.

---

## Behavior

1. System berechnet den Eigenkapitaleinsatz: EK = Gesamtkosten (FN-6.1.1.4) - Darlehenssumme.
2. System berechnet pro Jahr: entgangene Rendite = EK * (1 + r)^n - EK.
3. System berechnet die kumulierten Opportunitaetskosten ueber den Projektionszeitraum.
4. System addiert die Opportunitaetskosten zu den Netto-Mietkosten im Vergleich.
5. System zeigt die Opportunitaetskosten als separaten Posten in der Aufstellung.

---

## Postconditions

- Opportunitaetskosten sind berechnet.
- Wert ist in den Miet-Kauf-Vergleich integriert.
- Separate Darstellung als Posten ist sichtbar.

---

## Error Handling

- Das System soll bei EK = 0 (100% Finanzierung) die Opportunitaetskosten auf 0 setzen.
- Das System soll bei unrealistischer Alternativrendite (> 15%) eine Warnung anzeigen.

---

## Acceptance Criteria (functional)

- [ ] EK 100000 EUR, 6% Rendite, 10 Jahre: Opportunitaetskosten = 79085 EUR.
- [ ] EK 0 (Vollfinanzierung): Opportunitaetskosten = 0 EUR.
- [ ] Aenderung der Alternativrendite berechnet sofort neu.
- [ ] Break-Even verschiebt sich bei hoeherer Opportunitaetsrendite nach rechts.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
