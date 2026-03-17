---
type: notification
id: NTF-8
title: "Vermoegen Schwellwert"
status: draft
version: "1.0"
date: "2026-03-15"
channels: ["In-App", "E-Mail"]
crossCutting: true
---

# NTF-8: Vermoegen Schwellwert

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
| FN-8.1.1.1 | Vermoegen unter Schwellwert | Gesamtvermoegen faellt unter nutzerdefinierten Schwellwert oder aendert sich um > 10% zum Vormonat. |

---

## Content per Channel

### Push

| Feld | Wert |
| --- | --- |
| Title | Vermoegensaenderung |
| Body | Ihr Gesamtvermoegen hat sich um {change_percent}% zum Vormonat geaendert. |
| Action | Oeffne Dashboard |

### E-Mail

| Feld | Wert |
| --- | --- |
| Subject | WealthPilot: Vermoegensaenderung erkannt |
| Template | threshold-alert |
| CTA | Dashboard oeffnen |
| CTA-URL | /dashboard |

### SMS

<!-- SMS nicht aktiviert fuer diese Notification. -->

### In-App (Toast/Snackbar)

| Feld | Wert |
| --- | --- |
| Title | Vermoegensaenderung |
| Body | Gesamtvermoegen: {change_percent}% zum Vormonat. |
| Duration | 10s |
| Action | Details anzeigen |

---

## User Preferences

| Setting | Default | Configurable |
| --- | --- | --- |
| Kanalwahl | In-App | Ja |
| Schwellwert | 10% | Ja |
| Haeufigkeit | Taeglich (max 1x) | Ja |

---

## i18n

| Sprache | Status |
| --- | --- |
| DE | Primaer |
| EN | Geplant |

---

## Acceptance Criteria

- [ ] Notification wird bei > 10% Aenderung (oder nutzerdef. Schwellwert) ausgeloest.
- [ ] Nutzer kann E-Mail aktivieren/deaktivieren.
- [ ] Nutzer kann Schwellwert anpassen (1-50%).
- [ ] Max 1 Notification pro Tag pro Nutzer.
