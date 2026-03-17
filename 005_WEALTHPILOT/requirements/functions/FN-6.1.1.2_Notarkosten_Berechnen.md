---
type: function
id: FN-6.1.1.2
status: draft
parent: CMP-6.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.1.1.2: Notarkosten Berechnen

> **Parent**: [CMP-6.1.1](../components/CMP-6.1.1_Nebenkostenrechner.md)

---

## Functional Description

Das System muss die Notarkosten pauschal mit 1.5% des Kaufpreises berechnen (Beurkundung + Vollzug).

- Das System soll den Pauschalsatz konfigurierbar machen.
- Das System soll die Kosten aufgeschluesselt darstellen: Beurkundung (1.0%) + Vollzug (0.5%).
- Das System soll den Wert in die Gesamtkostenaufstellung einfliessen lassen.

---

## Preconditions

- Kaufpreis ist eingegeben.

---

## Behavior

1. System laedt den konfigurierten Notarkosten-Satz (Standard: 1.5%).
2. System berechnet: Notarkosten = Kaufpreis * 0.015.
3. System zeigt Aufschluesselung: Beurkundung = Kaufpreis * 0.01, Vollzug = Kaufpreis * 0.005.
4. System aktualisiert die Gesamtkostenaufstellung (FN-6.1.1.4).

---

## Postconditions

- Notarkosten sind berechnet und aufgeschluesselt.
- Wert ist fuer die Gesamtkostenaufstellung verfuegbar.

---

## Error Handling

- Das System soll bei fehlendem Kaufpreis die Berechnung verhindern.

---

## Acceptance Criteria (functional)

- [ ] Kaufpreis 300000 EUR: Notarkosten = 4500 EUR (3000 + 1500).
- [ ] Aufschluesselung zeigt Beurkundung und Vollzug separat.
- [ ] Aktualisierung bei Kaufpreisaenderung erfolgt automatisch.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
