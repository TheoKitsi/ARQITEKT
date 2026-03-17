---
type: function
id: FN-9.2.1.4
status: draft
parent: CMP-9.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: ["NTF-DELETION-CONFIRM"]
---

# FN-9.2.1.4: Loeschbestaetigung Senden

> **Parent**: [CMP-9.2.1](../components/CMP-9.2.1_DSGVO_Loeschmodul.md)

---

## Functional Description

Das System muss dem Nutzer eine Bestaetigung senden mit: Liste der geloeschten Daten, Liste der aufbewahrten Daten mit Begruendung und Frist, Kontakt fuer Rueckfragen.

- Das System soll die Bestaetigung als E-Mail und als PDF-Attachment senden.
- Das System soll die Bestaetigung DSGVO-konform formulieren.
- Das System soll die Bestaetigung archivieren.

---

## Preconditions

- Loeschung (FN-9.2.1.3) ist abgeschlossen.
- E-Mail-Adresse des Nutzers ist (noch) bekannt (vor Loeschung gespeichert).

---

## Behavior

1. System kompiliert die Loeschbestaetigung: Geloeschte Daten (Kategorien), Aufbewahrte Daten (Kategorie, Rechtsgrundlage, Frist), Kontaktinformationen.
2. System rendert die Bestaetigung als PDF.
3. System sendet eine E-Mail mit dem PDF als Attachment an die (zuvor gesicherte) E-Mail-Adresse.
4. System archiviert die Bestaetigung fuer interne Nachweispflicht.
5. System schliesst den Loeschantrag (Status: "abgeschlossen").

---

## Postconditions

- Loeschbestaetigung ist per E-Mail + PDF gesendet.
- Bestaetigung ist archiviert.
- Loeschantrag ist abgeschlossen.

---

## Error Handling

- Das System soll bei E-Mail-Versandfehler den Versand in die Retry-Queue stellen (max 3 Versuche).
- Das System soll bei PDF-Renderingfehler die Bestaetigung als reinen E-Mail-Text senden.

---

## Acceptance Criteria (functional)

- [ ] E-Mail enthaelt PDF mit geloeschten und aufbewahrten Daten-Listen.
- [ ] Aufbewahrte Daten zeigen Rechtsgrundlage (z.B. "WpHG SS 83") und Frist.
- [ ] Kontaktdaten fuer Rueckfragen sind enthalten.
- [ ] Bestaetigung ist intern archiviert.
- [ ] E-Mail-Versandfehler: Retry funktioniert.

---

## Notifications

- Loeschbestaetigung per E-Mail mit PDF-Attachment (NTF-DELETION-CONFIRM).

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
