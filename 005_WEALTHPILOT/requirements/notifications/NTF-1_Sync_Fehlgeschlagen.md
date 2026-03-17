---
type: notification
id: NTF-1
title: "Sync Fehlgeschlagen"
status: draft
version: "1.0"
date: "2026-03-15"
channels: ["In-App", "E-Mail"]
crossCutting: true
---

# NTF-1: Sync Fehlgeschlagen

> **Type**: Notification (Cross-Cutting)

---

## Channel Configuration

| Channel | Enabled | Priority | Fallback |
| --- | --- | --- | --- |
| Push | Ja | Normal | - |
| E-Mail | Ja | Normal | - |
| SMS | Nein | - | - |
| In-App | Ja | Normal | - |

---

## Trigger

| FN-ID | Event | Condition |
| --- | --- | --- |
| FN-2.1.1.4 | PSD2-Sync-Fehler | finAPI-API gibt Fehlercode zurueck oder Timeout > 30s. |
| FN-2.2.1.2 | Depot-Sync-Fehler | Kursimport oder Positionsabgleich schlaegt fehl. |

---

## Content per Channel

### Push

| Feld | Wert |
| --- | --- |
| Title | Synchronisation fehlgeschlagen |
| Body | Die Kontosynchronisation fuer {bank_name} ist fehlgeschlagen. Bitte pruefen Sie die Verbindung. |
| Action | Oeffne Kontoaggregation |

### E-Mail

| Feld | Wert |
| --- | --- |
| Subject | WealthPilot: Synchronisation fehlgeschlagen |
| Template | sync-failed |
| CTA | Verbindung pruefen |
| CTA-URL | /accounts/connections |

### SMS

<!-- SMS nicht aktiviert fuer diese Notification. -->

### In-App (Toast/Snackbar)

| Feld | Wert |
| --- | --- |
| Title | Sync-Fehler |
| Body | {bank_name}: Synchronisation fehlgeschlagen. |
| Duration | 10s |
| Action | Verbindung pruefen |

---

## User Preferences

| Setting | Default | Configurable |
| --- | --- | --- |
| Kanalwahl | In-App + E-Mail | Ja |
| Haeufigkeit | Sofort | Nein |
| Gruppierung | Pro Bank | Nein |

---

## i18n

| Sprache | Status |
| --- | --- |
| DE | Primaer |
| EN | Geplant |

---

## Acceptance Criteria

- [ ] In-App-Notification erscheint innerhalb von 5s nach Sync-Fehler.
- [ ] E-Mail wird innerhalb von 60s gesendet.
- [ ] Nutzer kann E-Mail-Benachrichtigung deaktivieren.
- [ ] Mehrere Fehler derselben Bank werden gruppiert (max 1 E-Mail pro Stunde).
