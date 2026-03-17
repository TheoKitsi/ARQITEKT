---
name: User Stories Skill
description: Wissen für die Erstellung und Bewertung von User Stories. Genutzt von @architect und @review.
---

# User Stories — Skill Reference

## Zweck

Eine User Story (US) beschreibt eine **Nutzer-Anforderung** aus Sicht des Anwenders. Sie ist die Brücke zwischen Business-Sicht (SOL) und technischer Umsetzung (CMP/FN).

## Template

→ `requirements/templates/user-story.md`

## Format (strikt)

```markdown
> **Als** {Rolle}
> **möchte ich** {Fähigkeit/Aktion}
> **damit** {Nutzen/geschäftlicher Wert}
```

### Rollen-Beispiele

| Rolle | Bedeutung |
|---|---|
| neuer Nutzer | Noch nicht registriert/verifiziert |
| verifizierter Nutzer | Hat Verifizierung abgeschlossen |
| Premium-Nutzer | Zahlender Abonnent |
| Plattformbetreiber | Systembetreiber / Admin |
| Support-Mitarbeiter | Kundendienst |

## Akzeptanzkriterien — Regeln

Jedes AC muss:
1. **Testbar** sein — ein Tester kann eindeutig Ja/Nein sagen
2. **Unabhängig** sein — kein AC hängt von einem anderen ab
3. **Spezifisch** sein — Zahlen, Zeiten, Zustände benennen
4. **Format**: `AC-{sol}.{us}.{n}: {Testbare Aussage}`

### Gute Beispiele

- ✅ `AC-1.1.1: Nutzer kann eine Mobilnummer eingeben und erhält innerhalb von 60 Sekunden einen SMS-Code zur Bestätigung.`
- ✅ `AC-3.1.4: Ein Deal-Breaker bei einem der beiden Profile führt zum sofortigen Ausschluss — kein Match.`

### Schlechte Beispiele

- ❌ `AC-x.y.z: Das System funktioniert gut.` → Nicht testbar
- ❌ `AC-x.y.z: Der Nutzer ist zufrieden.` → Subjektiv
- ❌ `AC-x.y.z: Performance ist gut.` → Keine Zahlen

## Qualitätskriterien

- [ ] **User Story Format** korrekt (Als/möchte ich/damit)
- [ ] **6-10 Akzeptanzkriterien** (weniger = zu vage, mehr = zu groß → aufteilen)
- [ ] **Rolle definiert** — nicht "Nutzer" sondern welcher Nutzer
- [ ] **Nutzen klar** — "damit" ist nicht trivial
- [ ] **Unabhängig** — Kann alleine implementiert und getestet werden
- [ ] **Vertikal** — Schneidet durch alle Schichten (UI → Logic → Data)
- [ ] **CMP-Referenzen** — Mindestens 1 Komponente zugeordnet
- [ ] **Notification-Referenzen** — Wenn Benachrichtigungen ausgelöst werden

## INVEST-Kriterien

| Kriterium | Bedeutung | Check |
|---|---|---|
| **I**ndependent | Unabhängig von anderen US | Kann alleine released werden? |
| **N**egotiable | Verhandelbar, nicht Vertrag | Spielraum für Implementierung? |
| **V**aluable | Wertschöpfend für Nutzer/Business | Warum sollte es gebaut werden? |
| **E**stimable | Schätzbar | Kann man den Aufwand abschätzen? |
| **S**mall | Klein genug für 1 Sprint | Machbar in 1-2 Wochen? |
| **T**estable | Testbar über AC | Kann man Ja/Nein sagen? |

## Von US zu CMPs

1. Lies die US + alle ACs
2. Identifiziere technische Module die nötig sind
3. Jedes Modul = eine CMP
4. Typisch: 1-3 CMPs pro US
5. Eine CMP kann UI, Backend-Logik oder Daten-Komponente sein

## Anti-Patterns

- ❌ **Technische US**: "Als Entwickler möchte ich eine Datenbank" → Kein Nutzer-Wert
- ❌ **Epic als US**: US mit 15+ ACs → Aufteilen
- ❌ **Kein Nutzen**: "damit es funktioniert" → Warum?
- ❌ **Fehlende Rolle**: "Man möchte" → Wer genau?
