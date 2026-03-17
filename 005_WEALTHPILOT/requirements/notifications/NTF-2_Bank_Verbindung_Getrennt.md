---
type: notification
id: NTF-2
title: "Bank Verbindung Getrennt"
status: draft
version: "1.0"
date: "2026-03-15"
channels: ["In-App", "E-Mail"]
crossCutting: true
---

# NTF-2: Bank Verbindung Getrennt

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
| FN-2.1.1.4 | Consent abgelaufen | PSD2-Consent (90 Tage) ist abgelaufen oder wurde widerrufen. |

---

## Content per Channel

### Push

| Feld | Wert |
| --- | --- |
| Title | Bankverbindung getrennt |
| Body | Die Verbindung zu {bank_name} ist getrennt. Bitte erneuern Sie die PSD2-Zustimmung. |
| Action | Oeffne Kontoaggregation |

### E-Mail

| Feld | Wert |
| --- | --- |
| Subject | WealthPilot: Bankverbindung erneuern |
| Template | bank-disconnect |
| CTA | Verbindung erneuern |
| CTA-URL | /accounts/reconnect/{bank_id} |

### SMS

<!-- SMS nicht aktiviert fuer diese Notification. -->

### In-App (Toast/Snackbar)

| Feld | Wert |
| --- | --- |
| Title | Verbindung getrennt |
| Body | {bank_name}: PSD2-Zustimmung abgelaufen. |
| Duration | persistent |
| Action | Jetzt erneuern |

---

## User Preferences

| Setting | Default | Configurable |
| --- | --- | --- |
| Kanalwahl | In-App + E-Mail | Ja |
| Haeufigkeit | Sofort + Reminder nach 7 Tagen | Ja |
| Gruppierung | Pro Bank | Nein |

---

## i18n

| Sprache | Status |
| --- | --- |
| DE | Primaer |
| EN | Geplant |

---

## Acceptance Criteria

- [ ] In-App-Banner erscheint persistent bis Verbindung erneuert.
- [ ] E-Mail wird bei Trennung und als Reminder nach 7 Tagen gesendet.
- [ ] Nutzer kann Reminder deaktivieren.
- [ ] Nach Erneuerung: Banner verschwindet automatisch.
