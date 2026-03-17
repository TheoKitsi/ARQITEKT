---
type: function
id: FN-9.1.1.1
status: draft
parent: CMP-9.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-9.1.1.1: Event Loggen

> **Parent**: [CMP-9.1.1](../components/CMP-9.1.1_Audit_Logger.md)

---

## Functional Description

Das System muss regulatorisch relevante Events loggen: Typ, Nutzer-ID, Zeitstempel (UTC), Payload, IP-Adresse, Session-ID.

- Das System soll Events als immutable Eintraege in einer dedizierten Audit-Tabelle speichern.
- Das System soll die Events asynchron loggen (Non-Blocking fuer den Hauptprozess).
- Das System soll die Event-Typen konfigurierbar halten.

---

## Preconditions

- Audit-Tabelle ist in der Datenbank angelegt.
- Event-Typen sind konfiguriert (z.B. LOGIN, RISIKOPROFIL_CHANGE, DEPOT_CREATED, REPORT_GENERATED).

---

## Behavior

1. Ein regulatorisch relevantes Event tritt ein (z.B. Login, Risikoprofil-Aenderung).
2. System erstellt einen Audit-Datensatz: { event_type, user_id, timestamp_utc, payload, ip_address, session_id }.
3. System sendet den Datensatz asynchron an die Audit-Tabelle (Message-Queue oder async DB-Insert).
4. System stellt sicher: Kein UPDATE oder DELETE auf Audit-Eintraege moeglich (immutable).
5. System berechnet den Hash-Chain-Wert (FN-9.1.1.2) und speichert ihn mit.

---

## Postconditions

- Audit-Eintrag ist persistent und immutable gespeichert.
- Hash-Chain ist aktualisiert.
- Hauptprozess wurde nicht blockiert.

---

## Error Handling

- Das System soll bei Datenbankfehler den Event in eine Retry-Queue stellen.
- Das System soll bei Retry-Queue-Ueberlauf einen Admin-Alert ausloesen.
- Das System soll bei ungueltigem Event-Typ den Eintrag trotzdem loggen mit Typ "UNKNOWN".

---

## Acceptance Criteria (functional)

- [ ] Login-Event wird mit allen Feldern (Typ, User-ID, Timestamp, IP) geloggt.
- [ ] Audit-Eintrag kann nicht per SQL UPDATE/DELETE geaendert werden.
- [ ] Asynchrones Logging blockiert den Hauptprozess nicht (Response-Time unveraendert).
- [ ] Retry-Queue funktioniert bei Datenbankfehler.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
