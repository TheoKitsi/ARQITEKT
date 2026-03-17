---
type: function
id: FN-6.1.1.3
status: draft
parent: CMP-6.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.1.1.3: Grundbuchkosten Berechnen

> **Parent**: [CMP-6.1.1](../components/CMP-6.1.1_Nebenkostenrechner.md)

---

## Functional Description

Das System muss die Grundbuchkosten pauschal mit 0.5% des Kaufpreises berechnen (Eintragung Eigentuemer + Grundschuld).

- Das System soll den Pauschalsatz konfigurierbar machen.
- Das System soll die Kosten aufgeschluesselt darstellen.
- Das System soll den Wert in die Gesamtkostenaufstellung einfliessen lassen.

---

## Preconditions

- Kaufpreis ist eingegeben.

---

## Behavior

1. System laedt den konfigurierten Grundbuchkosten-Satz (Standard: 0.5%).
2. System berechnet: Grundbuchkosten = Kaufpreis * 0.005.
3. System zeigt Aufschluesselung: Eigentumseintragung (0.3%) + Grundschuldeintragung (0.2%).
4. System aktualisiert die Gesamtkostenaufstellung (FN-6.1.1.4).

---

## Postconditions

- Grundbuchkosten sind berechnet und aufgeschluesselt.
- Wert ist fuer die Gesamtkostenaufstellung verfuegbar.

---

## Error Handling

- Das System soll bei fehlendem Kaufpreis die Berechnung verhindern.

---

## Acceptance Criteria (functional)

- [ ] Kaufpreis 300000 EUR: Grundbuchkosten = 1500 EUR (900 + 600).
- [ ] Aufschluesselung zeigt Eigentums- und Grundschuldeintragung.
- [ ] Aktualisierung bei Kaufpreisaenderung erfolgt automatisch.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
