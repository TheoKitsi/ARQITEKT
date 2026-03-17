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

> **Typ**: Notification Definition
> **Cross-Cutting**: Kann von jeder FN referenziert werden

---

## Kanal-Konfiguration

| Kanal | Aktiviert | Priorität | Fallback |
|---|---|---|---|
| **Push** | ✅/❌ | {hoch/mittel/niedrig} | {Fallback-Kanal} |
| **E-Mail** | ✅/❌ | {hoch/mittel/niedrig} | — |
| **SMS** | ✅/❌ | {hoch/mittel/niedrig} | — |
| **In-App** | ✅/❌ | {hoch/mittel/niedrig} | — |

---

## Trigger

<!-- Welche Funktionen lösen diese Notification aus? -->

| FN-ID | Trigger-Event | Bedingung |
|---|---|---|
| {FN-x.y.z.a} | {Event-Name} | {Wann genau?} |

---

## Inhalt pro Kanal

### Push

| Feld | Wert |
|---|---|
| **Titel** | "{Notification-Titel}" |
| **Body** | "{Notification-Text mit {Platzhaltern}}" |
| **Action** | {Deep-Link / Screen} |

### E-Mail

| Feld | Wert |
|---|---|
| **Betreff** | "{Betreff}" |
| **Template** | {Template-Name} |
| **CTA** | "{Button-Text}" → {Link} |

### SMS

| Feld | Wert |
|---|---|
| **Text** | "{SMS-Text max 160 Zeichen}" |

### In-App (Toast/Snackbar)

| Feld | Wert |
|---|---|
| **Typ** | {info/success/warning/error} |
| **Text** | "{Notification-Text}" |
| **Duration** | {Sekunden / persistent} |
| **Action** | {Button + Ziel} |

---

## Nutzer-Präferenzen

<!-- Kann der Nutzer diese Notification abschalten/konfigurieren? -->

| Einstellung | Default | Änderbar |
|---|---|---|
| Kanal-Auswahl | {alle aktiv} | ✅/❌ |
| Timing | {sofort} | ✅/❌ |
| Gruppierung | {einzeln} | ✅/❌ |

---

## i18n

<!-- Notification-Texte müssen übersetzt werden -->

| Sprache | Status |
|---|---|
| DE | {draft/done} |
| EN | {draft/done} |

---

## Akzeptanzkriterien

- [ ] Notification wird innerhalb von {n} Sekunden nach Trigger zugestellt
- [ ] Fallback-Kanal wird genutzt wenn primärer Kanal fehlschlägt
- [ ] Nutzer kann Notification-Präferenzen konfigurieren
