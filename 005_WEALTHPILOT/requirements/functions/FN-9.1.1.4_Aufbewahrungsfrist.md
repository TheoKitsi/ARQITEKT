---
type: function
id: FN-9.1.1.4
status: draft
parent: CMP-9.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-9.1.1.4: Aufbewahrungsfrist

> **Parent**: [CMP-9.1.1](../components/CMP-9.1.1_Audit_Logger.md)

---

## Functional Description

Das System muss Audit-Logs mindestens 10 Jahre aufbewahren (HGB Aufbewahrungspflicht). Nach Ablauf der Frist werden Logs automatisch archiviert.

- Das System soll einen monatlichen Job fuer die Archivierung ausfuehren.
- Das System soll Logs aelter als 10 Jahre in Cold-Storage verschieben (nicht loeschen).
- Das System soll die Archivierung nachvollziehbar protokollieren.

---

## Preconditions

- Audit-Daten existieren.
- Cold-Storage (z.B. S3 Glacier) ist konfiguriert.

---

## Behavior

1. Monatlicher Cron-Job prueft alle Audit-Eintraege aelter als 10 Jahre.
2. System exportiert die betroffenen Eintraege als komprimiertes Archiv.
3. System uebertraegt das Archiv in Cold-Storage.
4. System verifiziert die Uebertragung (Checksum-Vergleich).
5. System entfernt die archivierten Eintraege aus der aktiven Datenbank.
6. System protokolliert die Archivierung: Anzahl Eintraege, Archiv-Pfad, Checksum.

---

## Postconditions

- Eintraege aelter als 10 Jahre sind im Cold-Storage.
- Aktive Datenbank enthaelt nur Eintraege der letzten 10 Jahre.
- Archivierung ist protokolliert.

---

## Error Handling

- Das System soll bei Cold-Storage-Fehler die Eintraege in der aktiven Datenbank belassen.
- Das System soll bei Checksum-Mismatch die Archivierung abbrechen und einen Admin-Alert ausloesen.
- Das System soll NIEMALS Audit-Eintraege endgueltig loeschen (nur archivieren).

---

## Acceptance Criteria (functional)

- [ ] Eintraege aelter als 10 Jahre werden archiviert.
- [ ] Archiv im Cold-Storage ist abrufbar.
- [ ] Checksum-Vergleich bestaetigt Integritaet.
- [ ] Bei Storage-Fehler bleiben Eintraege in der aktiven DB.
- [ ] Keine Eintraege werden endgueltig geloescht.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
