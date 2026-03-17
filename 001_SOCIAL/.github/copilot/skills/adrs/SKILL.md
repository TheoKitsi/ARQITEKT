---
name: Architecture Decision Records Skill
description: Wissen für die Erstellung von ADRs. Genutzt von @architect und @review.
---

# Architecture Decision Records — Skill Reference

## Zweck

Ein ADR dokumentiert eine **wichtige Architektur-Entscheidung** mit Kontext, Begründung, Alternativen und Konsequenzen. ADRs sind Cross-Cutting — sie gelten projekt-weit und werden nie gelöscht, nur als `deprecated` oder `superseded` markiert.

## Template

→ `requirements/templates/adr.md`

## Wann einen ADR schreiben?

| Situation | ADR nötig? |
|---|---|
| Technologie-Wahl (Framework, DB, Cloud) | ✅ |
| Architektur-Pattern (Monolith vs. Microservice) | ✅ |
| API-Design-Entscheidung (REST vs. GraphQL) | ✅ |
| Auth-Strategie (OAuth, JWT, Session) | ✅ |
| State-Management-Wahl | ✅ |
| Bibliothek für ein Feature | ❌ (zu klein) |
| Code-Style-Entscheidung | ❌ (→ Linter-Config) |
| Bug-Fix-Ansatz | ❌ (→ PR-Beschreibung) |

## ADR-Status

| Status | Bedeutung |
|---|---|
| `proposed` | Vorgeschlagen, noch nicht entschieden |
| `accepted` | Entschieden und gültig |
| `deprecated` | Nicht mehr gültig, aber historisch |
| `superseded` | Ersetzt durch neueren ADR (Link auf Nachfolger) |

**ADRs werden nie gelöscht** — sie sind Teil der Entscheidungshistorie.

## Qualitätskriterien

- [ ] **Kontext klar** — Welches Problem/welche Situation?
- [ ] **Entscheidung prägnant** — Ein Satz: "Wir verwenden X"
- [ ] **Mindestens 2 Alternativen** — Was wurde erwogen?
- [ ] **Pro/Contra pro Alternative** — Ehrliche Abwägung
- [ ] **Konsequenzen** — Positiv UND Negativ/Tradeoffs
- [ ] **Betroffene Requirements** — Welche SOL/CMP/FN sind betroffen

## Beispiel-ADRs (typisch)

| ADR | Entscheidung |
|---|---|
| ADR-1 | Plattform: Progressive Web App statt Native |
| ADR-2 | Backend: Supabase statt eigener Server |
| ADR-3 | Matching-Algorithmus: Weighted Cosine Similarity |
| ADR-4 | Auth: Supabase Auth mit Email + Phone |
| ADR-5 | State: TanStack Query + Zustand |
| ADR-6 | i18n: next-intl mit ICU MessageFormat |

## Anti-Patterns

- ❌ **ADR ohne Alternativen**: "Wir verwenden React. Punkt." → Warum nicht Vue/Svelte?
- ❌ **ADR für Triviales**: "Wir verwenden Prettier" → Linter-Config reicht
- ❌ **ADR gelöscht**: Nie löschen — deprecated setzen
- ❌ **ADR ohne Konsequenzen**: Jede Entscheidung hat Tradeoffs
