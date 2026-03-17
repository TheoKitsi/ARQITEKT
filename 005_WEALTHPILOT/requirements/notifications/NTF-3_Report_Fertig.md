---
type: notification
id: NTF-3
title: "Report Fertig"
status: draft
version: "1.0"
date: "2026-03-15"
channels: ["In-App", "E-Mail"]
crossCutting: true
---

# NTF-3: Report Fertig

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
| FN-8.2.1.1 | PDF-Report generiert | Headless-Rendering ist abgeschlossen und PDF ist gespeichert. |

---

## Content per Channel

### Push

| Feld | Wert |
| --- | --- |
| Title | Report fertig |
| Body | Ihr Vermoegensreport "{report_name}" ist fertig und kann heruntergeladen werden. |
| Action | Oeffne Reports |

### E-Mail

| Feld | Wert |
| --- | --- |
| Subject | WealthPilot: Ihr Report ist fertig |
| Template | report-ready |
| CTA | Report herunterladen |
| CTA-URL | /reports/{report_id}/download |

### SMS

<!-- SMS nicht aktiviert fuer diese Notification. -->

### In-App (Toast/Snackbar)

| Feld | Wert |
| --- | --- |
| Title | Report fertig |
| Body | "{report_name}" steht zum Download bereit. |
| Duration | 15s |
| Action | Herunterladen |

---

## User Preferences

| Setting | Default | Configurable |
| --- | --- | --- |
| Kanalwahl | In-App + E-Mail | Ja |
| Haeufigkeit | Sofort | Nein |
| Gruppierung | Pro Report | Nein |

---

## i18n

| Sprache | Status |
| --- | --- |
| DE | Primaer |
| EN | Geplant |

---

## Acceptance Criteria

- [ ] In-App-Notification erscheint innerhalb von 5s nach Report-Generierung.
- [ ] E-Mail enthaelt direkten Download-Link.
- [ ] Download-Link ist 30 Tage gueltig.
- [ ] Nutzer kann E-Mail deaktivieren (In-App bleibt immer aktiv).
