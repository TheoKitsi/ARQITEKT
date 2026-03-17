---
type: notification
id: NTF-7
title: "Mandant Willkommen"
status: draft
version: "1.0"
date: "2026-03-15"
channels: ["E-Mail"]
crossCutting: true
---

# NTF-7: Mandant Willkommen

> **Type**: Notification (Cross-Cutting)

---

## Channel Configuration

| Channel | Enabled | Priority | Fallback |
| --- | --- | --- | --- |
| Push | Nein | - | - |
| E-Mail | Ja | Normal | - |
| SMS | Nein | - | - |
| In-App | Nein | - | - |

---

## Trigger

| FN-ID | Event | Condition |
| --- | --- | --- |
| FN-10.1.1.1 | Mandant angelegt | Neuer Mandant wurde erstellt und initialer Admin-Account generiert. |

---

## Content per Channel

### Push

<!-- Push nicht aktiviert fuer diese Notification. -->

### E-Mail

| Feld | Wert |
| --- | --- |
| Subject | Willkommen bei WealthPilot — Ihr Zugang |
| Template | mandant-welcome |
| CTA | Account aktivieren |
| CTA-URL | /activate/{activation_token} |

### SMS

<!-- SMS nicht aktiviert fuer diese Notification. -->

### In-App (Toast/Snackbar)

<!-- In-App nicht aktiviert fuer diese Notification. -->

---

## User Preferences

| Setting | Default | Configurable |
| --- | --- | --- |
| Kanalwahl | E-Mail | Nein |
| Haeufigkeit | Einmalig | Nein |
| Gruppierung | Keine | Nein |

---

## i18n

| Sprache | Status |
| --- | --- |
| DE | Primaer |
| EN | Geplant |

---

## Acceptance Criteria

- [ ] E-Mail wird an die Kontaktperson des Mandanten gesendet.
- [ ] E-Mail enthaelt Aktivierungslink mit 48h-Gueltigkeit.
- [ ] E-Mail enthaelt Subdomain und initiale Zugangsdaten.
- [ ] Aktivierungslink ist kryptographisch sicher (256-bit Token).
