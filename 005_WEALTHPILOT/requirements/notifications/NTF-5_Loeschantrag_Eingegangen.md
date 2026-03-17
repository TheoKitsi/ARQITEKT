---
type: notification
id: NTF-5
title: "Loeschantrag Eingegangen"
status: draft
version: "1.0"
date: "2026-03-15"
channels: ["E-Mail"]
crossCutting: true
---

# NTF-5: Loeschantrag Eingegangen

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
| FN-9.2.1.1 | Loeschantrag erfasst | Nutzer hat DSGVO-Loeschantrag gestellt. |

---

## Content per Channel

### Push

<!-- Push nicht aktiviert fuer diese Notification. -->

### E-Mail

| Feld | Wert |
| --- | --- |
| Subject | WealthPilot: Ihr Loeschantrag ist eingegangen |
| Template | deletion-request |
| CTA | Status pruefen |
| CTA-URL | /settings/privacy/deletion-status |

### SMS

<!-- SMS nicht aktiviert fuer diese Notification. -->

### In-App (Toast/Snackbar)

<!-- In-App nicht aktiviert fuer diese Notification. -->

---

## User Preferences

| Setting | Default | Configurable |
| --- | --- | --- |
| Kanalwahl | E-Mail | Nein |
| Haeufigkeit | Sofort | Nein |
| Gruppierung | Keine | Nein |

---

## i18n

| Sprache | Status |
| --- | --- |
| DE | Primaer |
| EN | Geplant |

---

## Acceptance Criteria

- [ ] E-Mail bestaetigt den Eingang mit Ticket-Nummer.
- [ ] E-Mail nennt die 30-Tage-Frist.
- [ ] E-Mail wird innerhalb von 60s gesendet.
- [ ] Notification kann NICHT deaktiviert werden (DSGVO-Pflicht).
