---
type: function
id: FN-1.3.1.3
status: draft
parent: CMP-1.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.3.1.3: Profil Aenderung Protokollieren

> **Parent**: [CMP-1.3.1](../components/CMP-1.3.1_Risikoprofil_Fragebogen.md)

---

## Functional Description

Das System muss jede Aenderung des Risikoprofils mit Zeitstempel und vorherigem Wert im Audit-Log protokollieren (regulatorische Pflicht gemaess WpHG).

- Das System soll den alten und neuen Wert sowie den Aenderungsgrund erfassen.
- Das System soll die Protokollierung an den zentralen Audit-Logger (CMP-9.1.1) delegieren.
- Das System soll die Aenderungshistorie fuer den Compliance-Bericht bereitstellen.

---

## Preconditions

- Ein Risikoprofil existiert fuer den Nutzer.
- Der Audit-Logger (CMP-9.1.1) ist verfuegbar.

---

## Behavior

1. System erkennt eine Aenderung des Risikoprofils (neuer Score oder neue Klasse).
2. System erstellt einen Audit-Datensatz: Nutzer-ID, alter Score, neuer Score, alte Klasse, neue Klasse, Zeitstempel (UTC), Aenderungsgrund.
3. System sendet den Datensatz an den Audit-Logger (FN-9.1.1.1).
4. System speichert die Aenderung als immutable Eintrag (kein Update/Delete moeglich).

---

## Postconditions

- Die Aenderung ist im Audit-Log unveraenderlich protokolliert.
- Der Compliance-Bericht kann die vollstaendige Aenderungshistorie abrufen.
- Der alte und neue Wert sind nachvollziehbar.

---

## Error Handling

- Das System soll bei Audit-Logger-Fehler die Risikoprofil-Aenderung trotzdem speichern und den Audit-Eintrag in eine Retry-Queue stellen.
- Das System soll bei Retry-Queue-Ueberlauf einen Administrator-Alert ausloesen.

---

## Acceptance Criteria (functional)

- [ ] Wechsel von "konservativ" zu "ausgewogen" wird mit beiden Werten protokolliert.
- [ ] Audit-Eintrag enthaelt UTC-Zeitstempel, Nutzer-ID und Aenderungsgrund.
- [ ] Audit-Eintraege koennen nicht nachtraeglich geaendert oder geloescht werden.
- [ ] Bei Audit-Logger-Ausfall wird die Aenderung in der Retry-Queue gespeichert.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
