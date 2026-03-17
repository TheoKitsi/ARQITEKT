---
type: function
id: FN-1.1.1.2
status: draft
parent: CMP-1.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.1.1.2: Depot Anlegen

> **Parent**: [CMP-1.1.1](../components/CMP-1.1.1_Konto_und_Depot_Erfassungsformular.md)

---

## Functional Description

Das System muss ein Wertpapierdepot mit folgenden Pflichtfeldern erfassen: Bankname, Depotnummer, Depottyp (Einzel/Gemeinschaftsdepot).

- Das System soll die Depotnummer auf Eindeutigkeit pro Nutzer pruefen.
- Das System soll optionale Felder bereitstellen: Verrechnungskonto-IBAN, Depotwaehrung, Eroeffnungsdatum.
- Das System soll das Depot nach Anlage sofort fuer die Depot-Synchronisation verfuegbar machen.

---

## Preconditions

- Nutzer ist authentifiziert.
- Mindestens ein Bankkonto ist bereits erfasst oder wird gleichzeitig angelegt.

---

## Behavior

1. Nutzer oeffnet das Depot-Erfassungsformular.
2. System zeigt Pflichtfelder (Bankname, Depotnummer, Depottyp) und optionale Felder.
3. Nutzer fuellt die Pflichtfelder aus und waehlt den Depottyp aus einer Dropdown-Liste.
4. System validiert Depotnummer auf Eindeutigkeit (kein Duplikat fuer diesen Nutzer).
5. Bei optionaler Verrechnungskonto-IBAN: System validiert IBAN (delegiert an FN-1.1.1.1).
6. System speichert das Depot verschluesselt (delegiert an FN-1.1.1.4).
7. System zeigt Erfolgsmeldung und leitet zur Vermoegensuebersicht weiter.

---

## Postconditions

- Das Depot ist persistent gespeichert und in der Vermoegensuebersicht sichtbar.
- Das Depot ist fuer die Depot-Sync-Engine (CMP-2.2.1) verfuegbar.
- Ein Audit-Event "DEPOT_CREATED" ist protokolliert.

---

## Error Handling

- Das System soll bei doppelter Depotnummer die Meldung "Diese Depotnummer existiert bereits" anzeigen.
- Das System soll bei fehlendem Pflichtfeld das Feld rot markieren und "Pflichtfeld" anzeigen.
- Das System soll bei Datenbankfehler die Eingabe im lokalen State halten und einen Retry-Button anbieten.

---

## Acceptance Criteria (functional)

- [ ] Depot wird mit allen Pflichtfeldern erfolgreich angelegt.
- [ ] Duplikat-Depotnummer fuer gleichen Nutzer wird abgelehnt.
- [ ] Gleiche Depotnummer fuer verschiedene Nutzer wird akzeptiert.
- [ ] Optionale Felder koennen leer bleiben.
- [ ] Depot erscheint sofort in der Vermoegensuebersicht.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
