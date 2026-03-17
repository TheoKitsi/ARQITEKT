---
type: function
id: FN-6.3.1.2
status: draft
parent: CMP-6.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.3.1.2: Kaufkosten Projizieren

> **Parent**: [CMP-6.3.1](../components/CMP-6.3.1_Miet_Kauf_Vergleichsmodul.md)

---

## Functional Description

Das System muss die monatlichen Gesamtkosten des Kaufs berechnen: Kreditrate + Instandhaltung (1-1.5% p.a.) + Hausgeld - steuerliche Vorteile.

- Das System soll die Instandhaltungskosten als Prozentsatz des Kaufpreises berechnen.
- Das System soll Hausgeld als optionale monatliche Eingabe akzeptieren.
- Das System soll die kumulierten Kaufkosten berechnen und projizieren.

---

## Preconditions

- Tilgungsplan ist erstellt (CMP-6.2.1).
- Kaufpreis und Nebenkosten (CMP-6.1.1) sind berechnet.
- Projektionszeitraum ist gewaehlt.

---

## Behavior

1. System laedt die monatliche Kreditrate aus dem Tilgungsplan.
2. System berechnet die monatlichen Instandhaltungskosten: Kaufpreis * Satz / 12.
3. Nutzer gibt optionales Hausgeld ein (EUR/Monat).
4. System berechnet die monatlichen Gesamtkosten = Kreditrate + Instandhaltung + Hausgeld.
5. Pro Jahr: System berechnet die jaehrlichen Gesamtkosten (ggf. mit Inflationsanpassung der Instandhaltung).
6. System berechnet die kumulierten Kaufkosten ueber den Projektionszeitraum.
7. System zeigt die Projektion als Linien-Chart.

---

## Postconditions

- Monatliche und kumulierte Kaufkosten sind berechnet.
- Kosten sind fuer den Break-Even-Vergleich (FN-6.3.1.3) verfuegbar.
- Linien-Chart ist gerendert.

---

## Error Handling

- Das System soll bei fehlender Kreditrate die Meldung "Bitte zuerst den Tilgungsplan erstellen" anzeigen.
- Das System soll bei negativem Hausgeld die Eingabe ablehnen.

---

## Acceptance Criteria (functional)

- [ ] Kreditrate 1375 EUR + Instandhaltung 375 EUR + Hausgeld 250 EUR = 2000 EUR/Monat.
- [ ] Kumulierte Kosten nach 30 Jahren sind korrekt berechnet.
- [ ] Linien-Chart zeigt den Kostenverlauf.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
