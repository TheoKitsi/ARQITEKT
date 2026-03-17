---
type: function
id: FN-2.1.1.4
status: draft
parent: CMP-2.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: ["NTF-CONSENT-RENEWAL"]
---

# FN-2.1.1.4: Consent Renewal

> **Parent**: [CMP-2.1.1](../components/CMP-2.1.1_PSD2_Kontoaggregations_Adapter.md)

---

## Functional Description

Das System muss 7 Tage vor Ablauf des 90-Tage-Consents eine E-Mail-Erinnerung senden und im Dashboard einen Renewal-Banner anzeigen.

- Das System soll taeglich pruefen welche Consents innerhalb von 7 Tagen ablaufen.
- Das System soll bei Nicht-Erneuerung am Ablauftag den Consent als "expired" markieren.
- Das System soll einen nahtlosen Renewal-Flow (One-Click) ueber finAPI anbieten.

---

## Preconditions

- Mindestens ein aktiver Consent existiert.
- E-Mail-Adresse des Nutzers ist verifiziert.

---

## Behavior

1. Taeglicher Cron-Job (07:00 UTC) prueft alle Consents mit Ablaufdatum <= heute + 7 Tage.
2. Pro betroffenen Consent: System sendet eine E-Mail-Erinnerung mit Renewal-Link.
3. System zeigt im Dashboard einen gelben Banner "Konto-Verknuepfung laeuft in X Tagen ab".
4. Nutzer klickt auf Renewal-Link: System initiiert den Consent-Flow (FN-2.1.1.1) mit Pre-Selection der Bank.
5. Bei erfolgreichem Renewal: System aktualisiert das Ablaufdatum (+ 90 Tage) und entfernt den Banner.
6. Bei Nicht-Erneuerung am Ablauftag: System setzt Status auf "expired" und stoppt den Sync.

---

## Postconditions

- Nutzer ist ueber den bevorstehenden Ablauf informiert (E-Mail + Banner).
- Bei Renewal: Consent ist um 90 Tage verlaengert.
- Bei Nicht-Renewal: Consent ist als "expired" markiert, Sync gestoppt.

---

## Error Handling

- Das System soll bei E-Mail-Versandfehler den Fehler loggen und den Banner dennoch anzeigen.
- Das System soll bei fehlgeschlagenem Renewal-Flow eine erneute E-Mail in 24 Stunden senden.
- Das System soll maximal 3 Erinnerungs-E-Mails pro Consent senden.

---

## Acceptance Criteria (functional)

- [ ] E-Mail wird genau 7 Tage vor Ablauf gesendet.
- [ ] Dashboard-Banner zeigt verbleibende Tage korrekt an.
- [ ] Renewal-Flow erneuert den Consent um 90 Tage.
- [ ] Nach Ablauf ohne Renewal wird Sync gestoppt und Status auf "expired" gesetzt.
- [ ] Maximal 3 Erinnerungs-E-Mails pro Consent.

---

## Notifications

- 7 Tage vor Ablauf: E-Mail-Erinnerung an den Nutzer (NTF-CONSENT-RENEWAL).

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
