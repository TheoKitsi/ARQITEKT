---
type: function
id: FN-6.2.1.4
status: draft
parent: CMP-6.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.2.1.4: Sondertilgung Einplanen

> **Parent**: [CMP-6.2.1](../components/CMP-6.2.1_Tilgungsplan_Generator.md)

---

## Functional Description

Das System muss optionale jaehrliche Sondertilgungen (max. X% der Darlehenssumme) im Tilgungsplan beruecksichtigen und den Laufzeit-Effekt berechnen.

- Das System soll den Sondertilgungsbetrag und den Rhythmus konfigurierbar machen.
- Das System soll die Laufzeitverkuerzung durch Sondertilgung berechnen.
- Das System soll die Zinsersparnis durch Sondertilgung anzeigen.

---

## Preconditions

- Tilgungsplan ist erstellt (FN-6.2.1.2).
- Sondertilgungsoption im Darlehensvertrag ist bekannt (max. Prozentsatz).

---

## Behavior

1. Nutzer gibt ein: Jaehrlicher Sondertilgungsbetrag (EUR) und Rhythmus (jaehrlich, einmalig).
2. System validiert: Sondertilgung <= max. Prozentsatz der Darlehenssumme.
3. System berechnet den Tilgungsplan mit Sondertilgungen: Restschuld reduziert sich zusaetzlich.
4. System berechnet die Laufzeitverkuerzung: Tage/Monate/Jahre schneller getilgt.
5. System berechnet die Gesamtzinsersparnis: Zinsen_ohne_ST - Zinsen_mit_ST.
6. System zeigt den Vergleich: mit/ohne Sondertilgung nebeneinander.

---

## Postconditions

- Tilgungsplan mit Sondertilgung ist berechnet.
- Laufzeitverkuerzung und Zinsersparnis sind quantifiziert.
- Vergleich mit/ohne Sondertilgung ist sichtbar.

---

## Error Handling

- Das System soll bei Sondertilgung > max. Prozentsatz die Meldung "Sondertilgung uebersteigt vertragliches Maximum" anzeigen.
- Das System soll bei Sondertilgung = 0 den Standard-Tilgungsplan beibehalten.

---

## Acceptance Criteria (functional)

- [ ] 5000 EUR/Jahr Sondertilgung bei 300000 EUR Darlehen verkuerzt die Laufzeit um ca. 5 Jahre.
- [ ] Zinsersparnis wird korrekt berechnet und angezeigt.
- [ ] Sondertilgung > 5% (Standard-Maximum) wird abgelehnt.
- [ ] Vergleich mit/ohne Sondertilgung ist klar dargestellt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
