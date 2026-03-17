---
type: notification
id: NTF-6
title: "Loeschbestaetigung"
status: draft
version: "1.0"
date: "2026-03-15"
channels: ["E-Mail"]
crossCutting: true
---

# NTF-6: Loeschbestaetigung

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
| FN-9.2.1.4 | Loeschung abgeschlossen | Loeschung und/oder Pseudonymisierung ist ausgefuehrt. |

---

## Content per Channel

### Push

<!-- Push nicht aktiviert fuer diese Notification. -->

### E-Mail

| Feld | Wert |
| --- | --- |
| Subject | WealthPilot: Ihre Daten wurden geloescht |
| Template | deletion-confirm |
| CTA | PDF-Bestaetigung herunterladen |
| CTA-URL | (als Attachment) |

### SMS

<!-- SMS nicht aktiviert fuer diese Notification. -->

### In-App (Toast/Snackbar)

<!-- In-App nicht aktiviert fuer diese Notification. -->

---

## User Preferences

| Setting | Default | Configurable |
| --- | --- | --- |
| Kanalwahl | E-Mail + PDF-Attachment | Nein |
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

- [ ] E-Mail enthaelt PDF-Bestaetigung als Attachment.
- [ ] PDF listet geloeschte Daten-Kategorien auf.
- [ ] PDF listet aufbewahrte Daten mit Rechtsgrundlage und Frist.
- [ ] Notification kann NICHT deaktiviert werden (DSGVO-Pflicht).
