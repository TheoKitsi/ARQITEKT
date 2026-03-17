---
type: function
id: FN-1.1.1.4
status: draft
parent: CMP-1.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.1.1.4: Verschluesselte Speicherung

> **Parent**: [CMP-1.1.1](../components/CMP-1.1.1_Konto_und_Depot_Erfassungsformular.md)

---

## Functional Description

Das System muss alle Finanzdaten AES-256-verschluesselt in der Datenbank speichern. Der Encryption-Key wird pro Nutzer aus einem KMS (Key Management Service) abgeleitet.

- Das System soll einen nutzerspezifischen Data Encryption Key (DEK) via KMS generieren.
- Das System soll den DEK mit einem Key Encryption Key (KEK) wrappen und nur den Ciphertext in der DB speichern.
- Das System soll bei Key-Rotation bestehende Daten transparent re-encrypten.

---

## Preconditions

- KMS-Verbindung ist verfuegbar.
- Nutzerkonto existiert mit zugeordnetem KEK.
- TLS 1.3 Verbindung zwischen Applikationsserver und Datenbank.

---

## Behavior

1. Bei Erstanlage: System generiert einen neuen DEK via KMS (AES-256-GCM).
2. System verschluesselt den DEK mit dem nutzerspezifischen KEK (Envelope Encryption).
3. System speichert den verschluesselten DEK in der Key-Tabelle.
4. Bei jeder Schreiboperation: System entschluesselt DEK, verschluesselt die Nutzdaten und speichert den Ciphertext.
5. Bei jeder Leseoperation: System entschluesselt DEK, entschluesselt Nutzdaten und gibt Klartext zurueck.
6. Bei Key-Rotation: System generiert neuen DEK, re-encryptet alle Daten in einer Batch-Transaktion.

---

## Postconditions

- Alle Finanzdaten sind ausschliesslich als AES-256-GCM Ciphertext in der DB gespeichert.
- Der DEK ist nur verschluesselt (wrapped) in der DB vorhanden.
- Klartext-Daten existieren nur im Applikationsspeicher waehrend der Verarbeitung.

---

## Error Handling

- Das System soll bei KMS-Timeout (>5s) die Operation abbrechen und einen 503-Fehler zurueckgeben.
- Das System soll bei Key-Rotation-Fehler einen Rollback durchfuehren und den Administrator benachrichtigen.
- Das System soll bei Entschluesselungsfehler (korrupter Ciphertext) den Vorfall loggen und den Datensatz als "corrupted" markieren.

---

## Acceptance Criteria (functional)

- [ ] Direkter Datenbank-Zugriff zeigt nur Ciphertext (kein Klartext sichtbar).
- [ ] Lesezugriff via API liefert korrekt entschluesselte Daten.
- [ ] Key-Rotation re-encryptet alle Datensaetze ohne Datenverlust.
- [ ] KMS-Ausfall verhindert Schreib-/Leseoperationen (fail-closed).
- [ ] DEK wird nie als Klartext geloggt oder in Fehlermeldungen exponiert.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
