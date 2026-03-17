---
type: function
id: FN-6.1.1.4
status: draft
parent: CMP-6.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.1.1.4: Gesamtkosten Aufstellen

> **Parent**: [CMP-6.1.1](../components/CMP-6.1.1_Nebenkostenrechner.md)

---

## Functional Description

Das System muss eine Gesamtkosten-Uebersicht anzeigen: Kaufpreis + Grunderwerbsteuer + Notar + Grundbuch + Makler = Gesamtkosten.

- Das System soll die Maklerkosten als optionalen Eingabewert akzeptieren (Standard: 3.57% inkl. MwSt).
- Das System soll die Gesamtkosten prominent als Summe anzeigen.
- Das System soll die Kostenstruktur als Tortendiagramm visualisieren.

---

## Preconditions

- Kaufpreis, Bundesland und ggf. Maklerkosten sind eingegeben.
- Einzelberechnungen (FN-6.1.1.1 bis FN-6.1.1.3) sind abgeschlossen.

---

## Behavior

1. System sammelt alle Einzelkosten: Grunderwerbsteuer (FN-6.1.1.1), Notarkosten (FN-6.1.1.2), Grundbuchkosten (FN-6.1.1.3).
2. System berechnet Maklerkosten: Kaufpreis * Maklersatz (Standard 3.57%, editierbar).
3. System berechnet Gesamtkosten = Kaufpreis + GrESt + Notar + Grundbuch + Makler.
4. System zeigt die Aufstellung als Tabelle: Position, Satz (%), Betrag (EUR).
5. System zeigt die Gesamtkosten prominent mit Hervorhebung.
6. System rendert ein Donut-Chart mit der Kostenstruktur.

---

## Postconditions

- Gesamtkostenaufstellung ist vollstaendig und sichtbar.
- Donut-Chart visualisiert die Kostenstruktur.
- Gesamtbetrag ist fuer den Tilgungsplan-Generator (CMP-6.2.1) verfuegbar.

---

## Error Handling

- Das System soll bei fehlenden Einzelberechnungen die verfuegbaren Kosten summieren und fehlende als "nicht berechnet" anzeigen.
- Das System soll bei Eingabe eines negativen Maklersatzes die Meldung "Maklersatz muss positiv sein" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Kaufpreis 300000 EUR, Bayern: Gesamt = 300000 + 10500 + 4500 + 1500 + 10710 = 327210 EUR.
- [ ] Maklersatz 0% (kein Makler): Maklerkosten entfallen.
- [ ] Donut-Chart zeigt Anteile korrekt.
- [ ] Summen-Zeile ist visuell hervorgehoben.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
