---
name: Solutions Skill
description: Wissen für die Erstellung und Bewertung von Solution Requirements. Genutzt von @architect und @review.
---

# Solutions — Skill Reference

## Zweck

Eine Solution (SOL) ist ein **Feature-Bereich** — ein abgrenzbarer Lösungsbaustein der einen Aspekt des Business Cases umsetzt. Sie enthält die Übersicht, Edge Cases und verweist auf ihre User Stories.

## Template

→ `requirements/templates/solution.md`

## Was gehört in eine SOL?

1. **Header**: ID, Titel, BC-Referenz, Version, Datum, Abhängigkeiten
2. **Übersicht**: Kennzahlen (US/CMP/FN Count) + 1-2 Absätze Beschreibung
3. **User Story Index**: Tabelle mit Links zu den US-Dateien
4. **Architektur/Kontext** (optional): ASCII/Mermaid-Diagramm wenn komplex
5. **Edge Cases**: Tabelle mit Szenario + Regelung

## Qualitätskriterien

- [ ] **Klar abgegrenzt** — Eine SOL löst EINEN Aspekt, nicht alles
- [ ] **1-5 User Stories** — Weniger als 1 = keine SOL nötig. Mehr als 5 = aufteilen.
- [ ] **Dependencies dokumentiert** — Upstream (← wovon abhängig) und Downstream (→ wer hängt von mir ab)
- [ ] **Edge Cases** — Mindestens 2-3 pro SOL
- [ ] **Keine Implementierungs-Details** — SOL beschreibt WAS, nicht WIE

## SOL-Aufteilung: Heuristiken

| Kriterium | → Eigene SOL |
|---|---|
| Unabhängig entwickelbar | ✅ |
| Eigene Nutzer-Perspektive | ✅ |
| Eigene Daten/Entitäten | ✅ |
| Kann abgeschaltet werden ohne alles zu brechen | ✅ |
| Nur ein Aspekt eines größeren Features | ❌ (gehört in bestehende SOL) |

## Typische SOL-Kategorien

| Kategorie | Beispiele |
|---|---|
| **Core** | Registrierung, Profil, Matching, Chat |
| **UX** | Onboarding, Dashboard, Tutorials |
| **Security** | Auth, Datenschutz, Moderation |
| **Monetization** | Abo, Payments, Premium-Features |
| **Analytics** | Tracking, Reporting, A/B-Tests |
| **Communication** | Notifications, Email, Push |
| **Administration** | Admin-Panel, Content-Management |

## Beispiel (SOCIAL)

**SOL-1: Verifizierte Registrierung & Identitätsprüfung**
- 2 User Stories (Mehrstufige Verifizierung + Duplikatverhinderung)
- 2 Komponenten, 7 Funktionen
- 4 Edge Cases (Ausweis fehlgeschlagen, Duplikat-Widerspruch, Alter, Wartezeit)
- Dependencies: → SOL-13 (Seriositätsscore nutzt Verifizierungsstatus)

## Edge Case Design

Gute Edge Cases beantworten:
1. **Was passiert wenn es schiefgeht?** (Fehlerfall)
2. **Was passiert am Rand?** (Grenzwerte)
3. **Was passiert bei Missbrauch?** (Böswilliger Nutzer)
4. **Was passiert bei Gleichzeitigkeit?** (Race Conditions)
5. **Was passiert bei Leere?** (Keine Daten, erster Nutzer)

## Anti-Patterns

- ❌ **God-SOL**: Alles in einer SOL → Aufteilen
- ❌ **Micro-SOL**: SOL mit nur 1 FN → Besser in bestehende SOL eingliedern
- ❌ **Keine Edge Cases**: Jede SOL hat Randfälle — wenn keine dokumentiert, wurde nicht tief genug nachgedacht
- ❌ **Implementierung in SOL**: "Wir verwenden PostgreSQL" → Gehört in ADR
- ❌ **Zirkuläre Dependencies**: SOL-A ↔ SOL-B → Aufbrechen oder zusammenführen
