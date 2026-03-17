---
name: Infrastructure Skill
description: Wissen für die Erstellung von Cross-Cutting Infrastructure Requirements (WCAG, OWASP, DSGVO, i18n, State, Performance, CI/CD).
---

# Infrastructure — Skill Reference

## Zweck

Infrastructure Requirements (INF) sind **Querschnitts-Anforderungen** die für alle oder viele Requirements gelten. Sie definieren Standards, Regeln und Prüfkriterien.

## Template

→ `requirements/templates/infrastructure.md`

## 7 Standard-INF-Kategorien

### INF-1: WCAG (Accessibility)

| Aspekt | Anforderung |
|---|---|
| Level | WCAG 2.1 AA (Pflicht seit EU EAA/BFSG Juni 2025) |
| Keyboard-Navigation | Alle Interaktionen per Tastatur erreichbar |
| Screen-Reader | Semantisches HTML, ARIA-Labels |
| Kontrast | Mindestens 4.5:1 für Text, 3:1 für große Texte |
| Focus-Management | Sichtbarer Focus-Ring, logische Tab-Reihenfolge |
| Motion | `prefers-reduced-motion` respektieren |
| Tooling | axe-core, Lighthouse, manueller Screen-Reader-Test |

### INF-2: OWASP (Security)

| Aspekt | Anforderung |
|---|---|
| Auth | Brute-Force-Schutz, Rate-Limiting, Session-Management |
| Input | Server-seitige Validierung aller Inputs (Zod/Joi) |
| XSS | Content-Security-Policy, Output-Encoding |
| CSRF | CSRF-Tokens für State-ändernde Requests |
| SQLi | Parameterisierte Queries, kein String-Concatenation |
| Secrets | Keine Secrets im Code, .env-Dateien, Key-Rotation |
| Dependencies | Regelmäßiger Audit (npm audit, Dependabot) |
| Headers | Helmet.js, HSTS, X-Frame-Options |

### INF-3: DSGVO (Datenschutz)

| Aspekt | Anforderung |
|---|---|
| Zweckbindung | Daten nur für definierten Zweck verarbeiten |
| Datenminimierung | Nur nötige Daten erheben |
| Einwilligung | Granulare Consent-Management vor Verarbeitung |
| Auskunftsrecht | Nutzer kann alle seine Daten exportieren (Art. 15) |
| Löschrecht | Nutzer kann Account + Daten löschen (Art. 17) |
| Verschlüsselung | At-rest (AES-256) + In-transit (TLS 1.3) |
| Aufbewahrung | Löschfristen pro Datentyp definiert |
| DPA | Data Processing Agreement mit allen Dienstleistern |

### INF-4: i18n (Internationalisierung)

| Aspekt | Anforderung |
|---|---|
| Sprachen | Initial: DE, EN. Erweiterbar. |
| Key-Format | Namespaced: `{feature}.{context}.{key}` |
| Pluralisierung | ICU MessageFormat |
| Zahlen/Datum | Locale-aware Formatierung |
| RTL | Vorbereitet aber nicht initial nötig |
| Translation-Workflow | Keys → Übersetzungsdatei → Review → Deploy |
| Fallback | EN als Fallback-Sprache |

### INF-5: State (State-Architektur)

| Aspekt | Anforderung |
|---|---|
| Client-State | Definiertes State-Management Pattern |
| Server-State | API-Caching-Strategie (TanStack Query o.ä.) |
| Offline | Offline-Erkennung + Graceful Degradation |
| Sync | Optimistic Updates + Conflict Resolution |
| Persistence | Welcher State überlebt App-Restart? |

### INF-6: Performance

| Aspekt | Anforderung |
|---|---|
| LCP | < 2.5s (Largest Contentful Paint) |
| FID | < 100ms (First Input Delay) |
| CLS | < 0.1 (Cumulative Layout Shift) |
| Bundle-Size | < 200KB initial JS (gzipped) |
| Lazy Loading | Routes + Images + Heavy Components |
| Caching | Service Worker, CDN, HTTP-Cache |

### INF-7: CI/CD

| Aspekt | Anforderung |
|---|---|
| Pipeline-Stages | Lint → Type-Check → Test → Build → Deploy |
| Test-Gates | 80% Coverage-Minimum, E2E-Tests grün |
| Environments | dev → staging → production |
| Deploy-Strategie | Zero-Downtime, Rollback möglich |
| PR-Checks | Automatischer Lint + Test + Preview-Deploy |

## Qualitätskriterien

- [ ] **Jede INF hat konkrete Regeln** — nicht nur "wir achten auf Security"
- [ ] **Tooling definiert** — Welche Tools prüfen automatisiert?
- [ ] **Betroffene Requirements gelistet** — Wo ist die INF besonders relevant?
- [ ] **Prüfkriterien testbar** — Kann in CI/CD geprüft werden?

## Anti-Patterns

- ❌ **Vage INF**: "System ist sicher" → Welche konkreten Maßnahmen?
- ❌ **Unrealistische Ziele**: "100% Test-Coverage" → Motiviert keinen
- ❌ **Fehlende INF-Referenzen in CMPs**: CMP mit Nutzerdaten ohne DSGVO-Verweis
- ❌ **Keine Tooling-Automation**: Manuelle Prüfung vergisst man
