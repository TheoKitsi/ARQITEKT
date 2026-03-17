---
type: ConversationFlow
id: "CONV-{sol}.{us}.{cmp}.{fn}.{n}"
title: "{TITLE}"
status: draft
version: "1.0"
date: "{DATE}"
parent: "FN-{sol}.{us}.{cmp}.{fn}"
bot_type: "{assistant|support|onboarding}"
---

# CONV-{sol}.{us}.{cmp}.{fn}.{n}: {TITLE}

> **Zugehörige Funktion**: [FN-{sol}.{us}.{cmp}.{fn}](../functions/FN-{sol}.{us}.{cmp}.{fn}_{parent_title}.md)
> **Bot-Typ**: {assistant | support | onboarding}

---

## Zweck

<!-- Was soll dieser Conversation Flow erreichen? -->

---

## Intents

| Intent-ID | Intent | Beispiel-Äußerungen |
|---|---|---|
| INT-1 | {Intent-Name} | "{Beispiel 1}", "{Beispiel 2}" |
| INT-2 | {Intent-Name} | "{Beispiel 1}", "{Beispiel 2}" |

---

## Conversation Flow

```
[User] → {Einstiegspunkt}
    │
    ├── Intent erkannt: {INT-1}
    │   └── [Bot] → {Response}
    │       ├── [User bestätigt] → {Nächster Schritt}
    │       └── [User verneint] → {Alternative}
    │
    ├── Intent erkannt: {INT-2}
    │   └── [Bot] → {Response}
    │
    └── Intent nicht erkannt
        └── [Bot] → Rückfrage / Eskalation
```

---

## Responses

| Response-ID | Bedingung | Antwort |
|---|---|---|
| RSP-1 | {Bedingung} | "{Bot-Antwort}" |
| RSP-2 | {Bedingung} | "{Bot-Antwort}" |

---

## Eskalation

| Trigger | Eskalationsziel | Verhalten |
|---|---|---|
| {3x nicht verstanden} | {Human Support} | {Ticket erstellen, Chat übergeben} |
| {Sensitive Daten} | {Datenschutz-Team} | {Weiterleitung mit Kontext} |

---

## Kontext-Daten

<!-- Welche Daten braucht der Bot aus dem System? -->

| Datenquelle | Verwendung |
|---|---|
| {Nutzerprofil} | {Personalisierung der Antworten} |

---

## Akzeptanzkriterien

- [ ] {Bot erkennt Intent X in >90% der Fälle}
- [ ] {Eskalation wird innerhalb von {n} Sekunden ausgelöst}
- [ ] {Conversation kann jederzeit abgebrochen werden}
