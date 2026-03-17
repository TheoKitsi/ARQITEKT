---
type: function
id: FN-9.1.1.2
status: draft
parent: CMP-9.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: ["NTF-AUDIT-BREACH"]
---

# FN-9.1.1.2: Hash Chain Sicherung

> **Parent**: [CMP-9.1.1](../components/CMP-9.1.1_Audit_Logger.md)

---

## Functional Description

Das System muss jeden Log-Eintrag kryptographisch an den vorherigen ketten (SHA-256 Hash des Vorgaenger-Eintrags), um Manipulation zu erkennen.

- Das System soll eine Hash-Chain (Blockchain-aehnlich) ueber die Audit-Eintraege bilden.
- Das System soll die Integritaet der Kette bei jeder Abfrage verifizieren koennen.
- Das System soll bei Kettenbruch einen Alert ausloesen.

---

## Preconditions

- Mindestens ein vorheriger Audit-Eintrag existiert (oder Genesis-Block).
- SHA-256 Algorithmus ist verfuegbar.

---

## Behavior

1. System laedt den Hash des letzten Audit-Eintrags (previous_hash).
2. System berechnet den Hash des neuen Eintrags: hash = SHA-256(event_type + user_id + timestamp + payload + previous_hash).
3. System speichert den berechneten Hash zusammen mit dem Audit-Eintrag.
4. Bei Integritaetspruefung: System iteriert ueber alle Eintraege und verifiziert die Hash-Kette.
5. Bei Kettenbruch: System markiert den betroffenen Eintrag und loest einen Admin-Alert aus.

---

## Postconditions

- Neuer Eintrag ist in die Hash-Kette integriert.
- Hash ist gespeichert.
- Integritaet ist verifizierbar.

---

## Error Handling

- Das System soll bei fehlendem previous_hash (erster Eintrag) den Genesis-Hash "0" verwenden.
- Das System soll bei Kettenbruch den betroffenen Bereich markieren und den Betrieb nicht unterbrechen.

---

## Acceptance Criteria (functional)

- [ ] Hash-Chain ist lueckenlos ueber alle Eintraege.
- [ ] Nachtraegliche Aenderung eines Eintrags bricht die Kette (verifizierbar).
- [ ] Kettenbruch loest Admin-Alert aus.
- [ ] Genesis-Block verwendet Hash "0".

---

## Notifications

- Bei Kettenbruch: Admin-Alert via E-Mail und In-App (NTF-AUDIT-BREACH).

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
