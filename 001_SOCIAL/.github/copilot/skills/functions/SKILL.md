---
name: Functions Skill
description: Wissen für die Erstellung funktionaler Requirements. Genutzt von @architect und @review.
---

# Functions — Skill Reference

## Zweck

Eine Function (FN) beschreibt ein **einzelnes, atomares Systemverhalten**. Es ist die niedrigste Ebene der Core-Hierarchie und direkt implementierbar.

## Template

→ `requirements/templates/function.md`

## Format (strikt)

```
Das System shall {präzise Verhaltensbeschreibung}.
```

### Gute Beispiele (aus SOCIAL)

- ✅ "Das System shall eine SMS-Code-Verifizierung bereitstellen, bei der ein einmaliger Code an die angegebene Mobilnummer gesendet und vom Nutzer bestätigt wird."
- ✅ "Das System shall Deal-Breaker als K.O.-Filter implementieren — bei Nichterfüllung eines Deal-Breakers wird das Profil sofort aus dem Matching ausgeschlossen."
- ✅ "Das System shall bei Duplikat-Verdacht die Registrierung blockieren, dem Nutzer eine verständliche Meldung anzeigen und automatisch ein Support-Ticket erstellen."

### Schlechte Beispiele

- ❌ "Das System soll gut funktionieren." → Nicht testbar
- ❌ "Das System verwendet PostgreSQL." → Implementierungs-Detail → ADR
- ❌ "Das System shall alles machen was nötig ist." → Zu vage

## Qualitätskriterien

- [ ] **"shall" Format** — Immer "Das System shall..."
- [ ] **Atomar** — Eine FN = ein Verhalten. Keine "und" die zwei Dinge verbinden.
- [ ] **Testbar** — Man kann einen Unit/Integration-Test dafür schreiben
- [ ] **Präzise** — Zahlen, Zeitfenster, Zustände benennen wo relevant
- [ ] **Unabhängig** — Kann einzeln implementiert werden
- [ ] **Fehlerfall benannt** — Was passiert wenn es schiefgeht?
- [ ] **NTF-Referenz** — Wenn diese FN eine Notification auslöst

## FN-Struktur (in eigener Datei)

1. **Funktionale Beschreibung**: "Das System shall..."
2. **Eingabe/Vorbedingung**: Was muss vorher gelten
3. **Verhalten**: Schritt-für-Schritt
4. **Ausgabe/Nachbedingung**: Was ist danach der Fall
5. **Fehlerbehandlung**: Tabelle Fehlerfall → Reaktion
6. **Akzeptanzkriterien**: Funktionale Testkriterien
7. **Notifications**: Welche NTFs werden ausgelöst
8. **Conversation Flows**: Verweis auf CONV wenn Chatbot beteiligt

## Granularität

| Zu grob | Richtig | Zu fein |
|---|---|---|
| "System verwaltet Nutzer" | "System prüft SMS-Code gegen gesendeten Code und bestätigt bei Übereinstimmung" | "System liest Byte 4-8 aus dem Response-Buffer" |

**Faustregel**: Eine FN sollte in 1-3 Sätzen beschreibbar sein und in wenigen Stunden implementierbar.

## Von FN zu CONV (optional)

Wenn eine FN Chatbot-Interaktion beinhaltet:
1. Identifiziere den Dialog-Anlass
2. Definiere Intents (was will der Nutzer?)
3. Definiere Responses (was antwortet der Bot?)
4. Definiere Eskalation (wann → Mensch?)
5. Erstelle CONV-Datei als Kind der FN

## Anti-Patterns

- ❌ **Kombi-FN**: "System speichert UND sendet UND loggt" → 3 separate FNs
- ❌ **Vage FN**: "System verarbeitet Daten" → Welche Daten? Wie?
- ❌ **Implementierungs-FN**: "System ruft REST-API auf" → Beschreibe WAS passiert, nicht WIE
- ❌ **Fehlende Fehlerbehandlung**: Was wenn der SMS-Provider down ist?
- ❌ **Kein Parent**: FN ohne CMP → Wo gehört sie hin?
