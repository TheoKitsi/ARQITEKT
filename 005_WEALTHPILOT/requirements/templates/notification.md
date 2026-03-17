---
type: Notification
id: "NTF-{n}"
title: "{TITLE}"
status: draft
version: "1.0"
date: "{DATE}"
channels: []
crossCutting: true
---

# NTF-{n}: {TITLE}

> **Type**: Notification Definition
> **Cross-Cutting**: Can be referenced by any FN

---

## Channel Configuration

| Channel | Enabled | Priority | Fallback |
|---|---|---|---|
| **Push** | yes/no | {high/medium/low} | {Fallback channel} |
| **Email** | yes/no | {high/medium/low} | -- |
| **SMS** | yes/no | {high/medium/low} | -- |
| **In-App** | yes/no | {high/medium/low} | -- |

---

## Trigger

| FN-ID | Trigger Event | Condition |
|---|---|---|
| {FN-x.y.z.a} | {Event name} | {When exactly?} |

---

## Content per Channel

### Push

| Field | Value |
|---|---|
| **Title** | "{Notification title}" |
| **Body** | "{Notification text with {placeholders}}" |
| **Action** | {Deep link / Screen} |

### Email

| Field | Value |
|---|---|
| **Subject** | "{Subject}" |
| **Template** | {Template name} |
| **CTA** | "{Button text}" -> {Link} |

### SMS

| Field | Value |
|---|---|
| **Text** | "{SMS text max 160 chars}" |

### In-App (Toast/Snackbar)

| Field | Value |
|---|---|
| **Type** | {info/success/warning/error} |
| **Text** | "{Notification text}" |
| **Duration** | {Seconds / persistent} |
| **Action** | {Button + Target} |

---

## User Preferences

| Setting | Default | Configurable |
|---|---|---|
| Channel selection | {all active} | yes/no |
| Timing | {immediate} | yes/no |
| Grouping | {individual} | yes/no |

---

## i18n

| Language | Status |
|---|---|
| EN | {draft/done} |
| DE | {draft/done} |

---

## Acceptance Criteria

- [ ] Notification is delivered within {n} seconds after trigger
- [ ] Fallback-Kanal wird genutzt wenn primärer Kanal fehlschlägt
- [ ] Nutzer kann Notification-Präferenzen konfigurieren
