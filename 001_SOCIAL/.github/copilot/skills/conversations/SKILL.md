---
name: Conversation Flows Skill
description: Wissen für die Erstellung von Chatbot/AI-Conversation Requirements. Genutzt von @architect und @review.
---

# Conversation Flows — Skill Reference

## Zweck

Ein Conversation Flow (CONV) beschreibt einen **strukturierten Dialog** zwischen einem Bot/AI-Assistenten und dem Nutzer. Es ist ein Kind von FN und definiert Intents, Responses und Eskalationspfade.

## Template

→ `requirements/templates/conversation.md`

## Wann braucht eine FN einen CONV?

| Situation | CONV nötig? |
|---|---|
| FN hat keinen Dialog | ❌ |
| FN zeigt nur eine Meldung | ❌ |
| FN hat einen geführten Assistenten | ✅ |
| FN hat einen Support-Chatbot | ✅ |
| FN hat ein Onboarding-Gespräch | ✅ |
| FN hat Freitext-Eingabe mit KI-Interpretation | ✅ |

## Bot-Typen

| Typ | Beschreibung | Beispiel |
|---|---|---|
| **assistant** | Hilft beim Ausfüllen, gibt Tipps | Onboarding-Assistent, Profil-Hilfe |
| **support** | Beantwortet Fragen, löst Probleme | FAQ-Bot, Ticket-Bot |
| **onboarding** | Führt durch initiale Konfiguration | Willkommens-Flow, Setup-Wizard |

## Intent-Design

### Gute Intents

- Spezifisch: `intent:change_email` statt `intent:settings`
- User-zentriert: Was WILL der Nutzer?
- Eindeutig: Kein Overlap zwischen Intents

### Intent-Tabelle

| Feld | Beschreibung |
|---|---|
| Intent-ID | Eindeutige Kennung (INT-1, INT-2, ...) |
| Intent | Beschreibender Name |
| Beispiel-Äußerungen | 3-5 natürlichsprachliche Varianten |

## Eskalations-Regeln

1. **Max 3 Rückfragen** bei nicht-verstandenem Intent → dann Eskalation
2. **Sensitive Themen** (Daten, Zahlung, Beschwerden) → sofort Eskalation
3. **Eskalation = Ticket + Kontext-Übergabe** — Nutzer muss sich nicht wiederholen

## Qualitätskriterien

- [ ] **Intents definiert** — Mindestens 2 Intents pro CONV
- [ ] **Beispiel-Äußerungen** — 3-5 pro Intent
- [ ] **Eskalation definiert** — Wann → Mensch?
- [ ] **Kontext-Daten** — Was braucht der Bot aus dem System?
- [ ] **Abbruch möglich** — Nutzer kann jederzeit raus
- [ ] **Mehrsprachig bedacht** — i18n für Bot-Texte

## Anti-Patterns

- ❌ **Endlos-Loop**: Bot fragt immer wieder dasselbe
- ❌ **Keine Eskalation**: Nutzer kommt nie zu einem Menschen
- ❌ **Zu viele Intents**: >10 Intents → Aufteilen in mehrere CONVs
- ❌ **Fehlender Kontext**: Bot kennt den Nutzer-Status nicht
