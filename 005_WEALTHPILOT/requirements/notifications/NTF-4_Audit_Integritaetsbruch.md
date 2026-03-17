---
type: notification
id: NTF-4
title: "Audit Integritaetsbruch"
status: draft
version: "1.0"
date: "2026-03-15"
channels: ["E-Mail"]
crossCutting: true
---

# NTF-4: Audit Integritaetsbruch

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
| FN-9.1.1.2 | Hash-Chain-Bruch | Integritaetspruefung erkennt Inkonsistenz in der Hash-Kette. |

---

## Content per Channel

### Push

<!-- Push nicht aktiviert fuer diese Notification. -->

### E-Mail

| Feld | Wert |
| --- | --- |
| Subject | KRITISCH: Audit-Log Integritaetsbruch erkannt |
| Template | audit-breach |
| CTA | Audit-Log pruefen |
| CTA-URL | /admin/audit?integrity=failed |

### SMS

<!-- SMS nicht aktiviert fuer diese Notification. -->

### In-App (Toast/Snackbar)

<!-- In-App nicht aktiviert fuer diese Notification. -->

---

## User Preferences

| Setting | Default | Configurable |
| --- | --- | --- |
| Kanalwahl | E-Mail (Admin) | Nein |
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

- [ ] E-Mail wird ausschliesslich an Compliance/Admin-Rolle gesendet.
- [ ] E-Mail enthaelt: betroffener Zeitraum, Anzahl betroffene Eintraege, Link zum Audit-Interface.
- [ ] E-Mail wird innerhalb von 30s nach Erkennung gesendet.
- [ ] Notification kann NICHT deaktiviert werden (regulatorisch).
