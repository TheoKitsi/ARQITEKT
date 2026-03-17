---
type: infrastructure
id: INF-2
title: "OWASP Security"
status: draft
version: "1.0"
date: "2026-03-15"
category: "OWASP"
crossCutting: true
constrains: [all]
---

# INF-2: OWASP Security

> **Category**: OWASP
> **Cross-Cutting**: Applies to all relevant requirements

---

## Infrastructure Description

Alle Anwendungskomponenten muessen gegen die OWASP Top 10 (2021) gehaertet sein. Als Finanzplattform mit PSD2-Anbindung und KI-Integration gelten erhoehte Sicherheitsanforderungen. Authentifizierung ueber OAuth 2.0 / OIDC mit MFA-Option fuer B2B-Mandanten.

---

## Non-Functional Constraints

| Rule-ID | Rule | Source | Mandatory |
|---|---|---|---|
| R-2.1 | Authentifizierung via OAuth 2.0 + PKCE; Session-Tokens als HTTP-only Secure Cookies | OWASP A07:2021 | yes |
| R-2.2 | Alle Benutzereingaben serverseitig validieren (Whitelist-Ansatz) | OWASP A03:2021 | yes |
| R-2.3 | SQL-Injection-Schutz: Ausschliesslich parametrisierte Queries / ORM | OWASP A03:2021 | yes |
| R-2.4 | XSS-Schutz: Output-Encoding, Content-Security-Policy Header | OWASP A03:2021 | yes |
| R-2.5 | CSRF-Schutz: SameSite Cookies + Anti-CSRF-Tokens | OWASP A01:2021 | yes |
| R-2.6 | Rate-Limiting: API-Endpunkte max. 100 req/min pro Nutzer, Login max. 5 Versuche/15min | OWASP A04:2021 | yes |
| R-2.7 | Dependency-Scanning: Automatische CVE-Pruefung aller Dependencies in CI | OWASP A06:2021 | yes |
| R-2.8 | Security-Header: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy | OWASP A05:2021 | yes |
| R-2.9 | Secrets-Management: Kein Hardcoding von Credentials; Vault-basierte Verwaltung | OWASP A02:2021 | yes |
| R-2.10 | Prompt-Injection-Schutz: Gemini-Inputs sanitizen, System-Prompt nicht exponieren | OWASP LLM01:2023 | yes |
| R-2.11 | RBAC: Rollenbasierte Zugriffskontrolle (Admin, Berater, Endkunde, Compliance) | OWASP A01:2021 | yes |
| R-2.12 | API-Authentifizierung: JWT mit RS256, max. 15min Lebensdauer, Refresh-Token 7 Tage | OWASP A07:2021 | yes |

---

## Affected Requirements

| Requirement | Relevance | Note |
|---|---|---|
| CMP-5.1.1 | high | Gemini Chat: Prompt-Injection-Schutz (R-2.10) |
| CMP-2.1.1 | high | PSD2-Adapter: OAuth-Flows, Token-Sicherheit |
| CMP-10.1.1 | high | Admin-Interface: RBAC, SSO-Integration |
| FN-10.1.1.4 | high | API-Key-Management: Sichere Generierung/Rotation |
| CMP-9.1.1 | high | Audit-Logger: Security-Events loggen |
| SOL-10 | high | Multi-Tenant: Isolation zwischen Mandanten |

---

## Verification Criteria

- [ ] OWASP ZAP Full-Scan: 0 High/Critical Findings
- [ ] Penetrationstest durch externen Dienstleister (jaehrlich)
- [ ] Dependency-Scan in CI: Build bricht bei Critical CVE
- [ ] Security-Header-Scan: securityheaders.com A+ Rating
- [ ] Login-Bruteforce-Test: Account-Lockout nach 5 Fehlversuchen
- [ ] Prompt-Injection-Testuite: 50+ Angriffsvektoren abgesichert

---

## Tooling / Automation

| Tool | Checks | Automated |
|---|---|---|
| OWASP ZAP | Full Application Scan | yes (CI) |
| Snyk / Dependabot | Dependency CVE Scanning | yes (CI) |
| ESLint Security Plugin | Code-Level Security Patterns | yes (CI) |
| HashiCorp Vault / GCP Secret Manager | Secrets Management | yes |
| Custom Security-Header Middleware | Header Injection | yes (Runtime) |
