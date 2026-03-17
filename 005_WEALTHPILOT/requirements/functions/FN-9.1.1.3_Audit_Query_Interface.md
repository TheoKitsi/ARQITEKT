---
type: function
id: FN-9.1.1.3
status: draft
parent: CMP-9.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-9.1.1.3: Audit Query Interface

> **Parent**: [CMP-9.1.1](../components/CMP-9.1.1_Audit_Logger.md)

---

## Functional Description

Das System muss der Compliance-Abteilung eine Such-Oberflaeche bieten: Filter nach Nutzer, Zeitraum, Event-Typ. Export als CSV.

- Das System soll eine datensatzbasierte Suche mit Pagination bieten.
- Das System soll den Export als CSV fuer Compliance-Reports ermoeglichen.
- Das System soll den Zugriff auf Compliance-Rolle beschraenken.

---

## Preconditions

- Nutzer hat die Rolle "Compliance" oder "Admin".
- Audit-Daten existieren.

---

## Behavior

1. Nutzer oeffnet das Audit-Query-Interface.
2. System zeigt Filterfelder: Nutzer-ID/Name, Zeitraum (von-bis), Event-Typ (Dropdown).
3. Nutzer setzt Filter und klickt "Suchen".
4. System fuehrt die Abfrage aus und zeigt Ergebnisse paginiert (50 pro Seite).
5. Pro Eintrag: Zeitstempel, Typ, Nutzer, Payload (aufklappbar), IP-Adresse.
6. Nutzer kann die Ergebnisse als CSV exportieren.
7. CSV enthaelt alle Felder der angezeigten Eintraege.

---

## Postconditions

- Suchergebnisse sind angezeigt.
- CSV-Export ist verfuegbar.

---

## Error Handling

- Das System soll bei nicht-autorisiertem Zugriff (falsche Rolle) eine 403-Fehlermeldung anzeigen.
- Das System soll bei sehr grossen Ergebnismengen (>10000) eine Warnung "Bitte Filter einschraenken" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Filter nach Nutzer-ID und Zeitraum liefert korrekte Ergebnisse.
- [ ] Pagination funktioniert (50 pro Seite).
- [ ] CSV-Export enthaelt alle Felder.
- [ ] Nicht-Compliance-Nutzer erhaelt 403.
- [ ] Grosse Ergebnismenge (>10000) zeigt Warnung.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
