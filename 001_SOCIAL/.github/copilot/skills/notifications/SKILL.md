---
name: Notifications Skill
description: Wissen für die Erstellung von Notification-Requirements über alle Kanäle. Genutzt von @architect und @review.
---

# Notifications — Skill Reference

## Zweck

Ein Notification Requirement (NTF) definiert einen **Benachrichtigungskanal** samt Trigger, Inhalts-Templates und Nutzer-Präferenzen. NTFs sind Cross-Cutting — sie werden von FNs referenziert über die `triggers`-Beziehung.

## Template

→ `requirements/templates/notification.md`

## 5 Kanäle

| Kanal | Eigenschaft | Use Cases |
|---|---|---|
| **Push** | Sofort, kurz, actionable | Match gefunden, Chat-Nachricht, Status-Update |
| **E-Mail** | Ausführlich, persistent, formal | Verifizierung, Rechnungen, Zusammenfassungen |
| **SMS** | Sofort, kurz, hohe Zustellrate | 2FA-Codes, kritische Warnungen |
| **In-App** | Kontextbezogen, nicht-invasiv | Toast/Snackbar, Notification-Center, Badge |

## Notification-Architektur

```
FN-x.y.z.a (Trigger-Event)
    │
    └── triggers: NTF-{n}
         │
         ├── Kanal-Routing (Nutzer-Präferenzen + Priorität)
         │   ├── Push → FCM/APNs
         │   ├── Email → SMTP/Transactional
         │   ├── SMS → Gateway
         │   └── In-App → WebSocket/SSE
         │
         └── Fallback-Kette (wenn Primär-Kanal fehlschlägt)
```

## Prioritäts-Logik

| Priorität | Kanäle | Beispiel |
|---|---|---|
| **Kritisch** | SMS + Push + In-App | 2FA-Code, Account-Sperrung |
| **Hoch** | Push + Email + In-App | Neuer Match, Chat-Nachricht |
| **Mittel** | Push + In-App | Profil-Verbesserung, Reminder |
| **Niedrig** | In-App only | Allgemeine Tipps, Feature-Updates |

## Qualitätskriterien

- [ ] **Alle Kanäle definiert** — Welche aktiv, welche nicht
- [ ] **Trigger dokumentiert** — Welche FN löst das aus
- [ ] **Inhalte pro Kanal** — Titel, Body, CTA für jeden aktiven Kanal
- [ ] **Fallback definiert** — Was wenn Push fehlschlägt
- [ ] **i18n** — Texte in allen unterstützten Sprachen
- [ ] **Nutzer-Kontrolle** — Kann der Nutzer abschalten? Welche?
- [ ] **DSGVO-konform** — Keine sensiblen Daten im Push/SMS-Text

## Anti-Patterns

- ❌ **Spam**: Zu viele Notifications → Nutzer deaktiviert alles
- ❌ **Keine Priorität**: Alles als "hoch" → Nichts ist mehr wichtig
- ❌ **Sensible Daten**: Match-Name in Push-Preview auf Sperrbildschirm
- ❌ **Kein Opt-out**: Nutzer MUSS alles empfangen → DSGVO-Verstoß
- ❌ **Fehlender Fallback**: Push-down → Nutzer erfährt nie davon
