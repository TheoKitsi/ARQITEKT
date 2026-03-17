---
type: function
id: FN-1.2.1.3
status: draft
parent: CMP-1.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.2.1.3: Sparquote Berechnen

> **Parent**: [CMP-1.2.1](../components/CMP-1.2.1_Einnahmen_Ausgaben_Modul.md)

---

## Functional Description

Das System muss die monatliche Sparquote berechnen: (Einnahmen - Ausgaben) / Einnahmen * 100. Anzeige als Prozentwert und als absoluter Eurobetrag.

- Das System soll alle Einnahmen und Ausgaben auf einen monatlichen Betrag normalisieren (quartalsweise / 3, jaehrlich / 12).
- Das System soll die Sparquote als Echtzeit-Widget im Dashboard anzeigen.
- Das System soll bei negativer Sparquote eine Warnung anzeigen.

---

## Preconditions

- Mindestens eine Einnahme ist erfasst.
- Mindestens eine Ausgabe ist erfasst (oder Ausgaben = 0).

---

## Behavior

1. System laedt alle aktiven Einnahmen des Nutzers.
2. System normalisiert jede Einnahme auf monatlichen Betrag (quartalsweise / 3, jaehrlich / 12).
3. System laedt alle aktiven Ausgaben und normalisiert analog.
4. System berechnet: Sparquote_Prozent = (Summe_Einnahmen - Summe_Ausgaben) / Summe_Einnahmen * 100.
5. System berechnet: Sparquote_Absolut = Summe_Einnahmen - Summe_Ausgaben.
6. System zeigt Prozentwert und Absolutwert im Widget an.
7. Bei Sparquote < 0: System zeigt Warnhinweis "Ausgaben uebersteigen Einnahmen".

---

## Postconditions

- Die Sparquote ist als Prozent- und Absolutwert sichtbar.
- Bei negativer Sparquote ist ein Warnhinweis sichtbar.
- Die Berechnung aktualisiert sich bei jeder Aenderung von Einnahmen/Ausgaben.

---

## Error Handling

- Das System soll bei Division durch Null (keine Einnahmen) die Sparquote als "n/a" anzeigen.
- Das System soll bei Berechnungsfehler den letzten gueltigen Wert beibehalten und "Aktualisierung fehlgeschlagen" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Bei 3500 EUR Einnahmen und 2500 EUR Ausgaben wird 28.57% und 1000 EUR angezeigt.
- [ ] Quartalsweise Einnahme von 3000 EUR wird als 1000 EUR/Monat normalisiert.
- [ ] Negative Sparquote loest Warnung aus.
- [ ] Keine Einnahmen zeigt "n/a" statt Divisionsfehler.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
