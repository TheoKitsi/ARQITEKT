---
type: function
id: FN-4.1.1.3
status: draft
parent: CMP-4.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.1.1.3: Ziel Definieren

> **Parent**: [CMP-4.1.1](../components/CMP-4.1.1_Umschichtungs_Konfigurator.md)

---

## Functional Description

Das System muss folgende Ziele unterstuetzen: Immobilienkauf, neues Depot, bestehendes Depot aufstocken, Schuldenabbau, Liquiditaetsreserve, Sonstiges.

- Das System soll pro Zieltyp spezifische Parameter abfragen.
- Das System soll eine Ziel-Beschreibung als Freitext erlauben.
- Das System soll das Ziel fuer die Impact-Berechnung parametrisieren.

---

## Preconditions

- Umschichtungsbetrag ist definiert (FN-4.1.1.2).
- Konfigurator-Schritt "Ziel" ist aktiv.

---

## Behavior

1. System zeigt die verfuegbaren Zieltypen als Karten-Auswahl.
2. Nutzer waehlt einen Zieltyp.
3. System zeigt zielspezifische Parameter: Immobilienkauf (Kaufpreis, PLZ), Depot (Zieldepot, ISIN), Schuldenabbau (Kredit-ID, Betrag).
4. Nutzer fuellt die Parameter aus.
5. Optional: Nutzer gibt eine Freitext-Beschreibung ein.
6. System speichert den Zieltyp und die Parameter im Konfigurator-State.

---

## Postconditions

- Zieltyp und Parameter sind definiert.
- Das Ziel ist fuer die Impact-Berechnung (CMP-4.2.1) parametrisiert.
- Beschreibung ist optional gespeichert.

---

## Error Handling

- Das System soll bei fehlendem Zieltyp den "Weiter"-Button deaktivieren.
- Das System soll bei unvollstaendigen zielspezifischen Parametern eine Fehlermeldung anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Zieltyp "Immobilienkauf" zeigt Felder fuer Kaufpreis und PLZ.
- [ ] Zieltyp "Bestehendes Depot aufstocken" zeigt Dropdown mit vorhandenen Depots.
- [ ] Freitext-Beschreibung wird gespeichert (max. 500 Zeichen).
- [ ] Fehlender Zieltyp blockiert Fortschritt.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
