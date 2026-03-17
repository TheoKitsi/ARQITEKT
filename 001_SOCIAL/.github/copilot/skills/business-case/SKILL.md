---
name: Business Case Skill
description: Wissen für die Erstellung und Bewertung von Business Cases. Genutzt von @discover Agent.
---

# Business Case — Skill Reference

## Zweck

Ein Business Case (BC) ist das **Wurzel-Dokument** eines ARQITEKT-Projekts. Es definiert Vision, Scope, Monetarisierung und Erfolgskriterien — alles Weitere leitet sich davon ab.

## Template

→ `requirements/templates/business-case.md`

## Interview-Fragen (für @discover Agent)

Der @discover Agent stellt diese Fragen um einen BC zu generieren. Nicht alle sind Pflicht — der Agent erkennt welche relevant sind.

### Phase 1: Vision & Problem (Pflicht)

1. **Was ist die Kernidee in einem Satz?**
2. **Welches Problem wird gelöst? Was fehlt am Markt?**
3. **Für wen ist das Produkt? (Zielgruppe, Persona)**
4. **Was unterscheidet es von bestehenden Lösungen?**

### Phase 2: Scope & Funktionalität (Pflicht)

5. **Was sind die 3-5 wichtigsten Features?**
6. **Was ist explizit NICHT enthalten? (Out of Scope)**
7. **Gibt es eine Prioritäts-Reihenfolge der Features?**

### Phase 3: Business & Monetarisierung (Empfohlen)

8. **Wie soll Geld verdient werden? (Abo, Freemium, Pay-per-Use, Werbung, ...)**
9. **Was sind die Erfolgskriterien / KPIs?**
10. **Gibt es regulatorische Anforderungen? (DSGVO, Branchenspezifisch)**

### Phase 4: Technische Rahmenbedingungen (Optional)

11. **Welche Plattform? (Web, Mobile, Desktop, Cross-Platform)**
12. **Gibt es bestehende Systeme/APIs die integriert werden müssen?**

## Qualitätskriterien

Ein guter BC hat:

- [ ] **Klare Vision** — In 2-3 Sätzen verständlich was gebaut wird
- [ ] **Definierter Scope** — In-Scope UND Out-of-Scope
- [ ] **Identifizierte Zielgruppe** — Wer nutzt es?
- [ ] **Monetarisierung** — Wie wird Geld verdient (oder: Warum nicht)?
- [ ] **Kernprinzipien** — 3-7 Leitprinzipien die das Produkt definieren
- [ ] **Requirements-Tree-Map** — Übersicht aller SOLs mit ihrer Hierarchie
- [ ] **Glossar** — Fachbegriffe die im Projekt verwendet werden
- [ ] **Messbare Erfolgskriterien** — KPIs mit Zielwerten

## Beispiel (SOCIAL Projekt)

Referenz: `requirements/00_BUSINESS_CASE.md`

**Vision-Beispiel**:
> Diese Plattform ist für Menschen, die wirklich den Partner fürs Leben suchen. Wie bei jeder großen Lebensentscheidung beginnt die Suche mit Selbsterkenntnis und Klarheit, nicht mit einem Wisch nach rechts.

**Prinzipien-Beispiel**:
| Prinzip | Beschreibung |
|---|---|
| Trichter-Modell | Vom Groben ins Feine — 5 Ebenen |
| Entschleunigung | Begrenzte, kuratierte Vorschläge statt endlosem Wischen |

## Anti-Patterns

- ❌ **Zu vage**: "Wir bauen eine App" → Kein klares Problem/Lösung
- ❌ **Zu technisch**: BC beschreibt WAS und WARUM, nicht WIE
- ❌ **Kein Scope**: Alles ist "in scope" → Projekt wird nie fertig
- ❌ **Feature-Liste statt Vision**: BC ist keine Feature-Liste — er gibt Richtung
- ❌ **Kein Glossar**: Wenn im Team verschiedene Begriffe für dasselbe verwendet werden

## Von BC zu SOLs

Nach BC-Erstellung schlägt der Agent SOL-Aufteilung vor:
1. Lies Vision + Scope
2. Identifiziere unabhängige Feature-Bereiche
3. Jeder Bereich = eine SOL
4. Typisch: 5-20 SOLs pro BC
5. SOLs in logische Gruppen ordnen (Core, UX, Security, Monetization, ...)
