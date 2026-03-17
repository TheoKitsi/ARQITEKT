---
type: infrastructure
id: INF-5
title: "Performance und Skalierung"
status: draft
version: "1.0"
date: "2026-03-15"
category: "Performance"
crossCutting: true
constrains: [all]
---

# INF-5: Performance und Skalierung

> **Category**: Performance
> **Cross-Cutting**: Applies to all relevant requirements

---

## Infrastructure Description

WealthPilot muss auch unter Last reaktionsfaehig bleiben. Ziel: 100 gleichzeitige Mandanten mit je bis zu 500 aktiven Nutzern. Kritische Berechnungen (Impact-Simulation, Rendite-Engine) haben erhoehte Latenzbudgets, muessen aber innerhalb definierter SLAs bleiben.

---

## Non-Functional Constraints

| Rule-ID | Rule | Source | Mandatory |
|---|---|---|---|
| R-5.1 | API-Response-Time: P95 < 200ms fuer CRUD-Operationen | SLA | yes |
| R-5.2 | API-Response-Time: P95 < 2000ms fuer Rendite-Berechnungen | SLA | yes |
| R-5.3 | API-Response-Time: P95 < 5000ms fuer Impact-Simulation (Monte-Carlo) | SLA | yes |
| R-5.4 | Frontend Time-to-Interactive: < 3s auf 4G-Verbindung | Core Web Vitals | yes |
| R-5.5 | Largest Contentful Paint (LCP): < 2.5s | Core Web Vitals | yes |
| R-5.6 | Cumulative Layout Shift (CLS): < 0.1 | Core Web Vitals | yes |
| R-5.7 | PDF-Report-Generierung: < 10s fuer Standard-Report | SLA | yes |
| R-5.8 | PSD2-Sync: Hintergrund-Job, kein Nutzer-Blocking | Architektur | yes |
| R-5.9 | Caching: Rendite-Berechnungen gecacht, Invalidierung bei neuen Transaktionen | Architektur | yes |
| R-5.10 | Database: Connection-Pooling, Read-Replicas fuer Reporting-Queries | Architektur | yes |
| R-5.11 | Horizontal Scaling: Stateless API-Server, Auto-Scaling bei > 70% CPU | DevOps | yes |

---

## Affected Requirements

| Requirement | Relevance | Note |
|---|---|---|
| CMP-4.2.1 | high | Monte-Carlo-Simulation: Heaviest Computation (R-5.3) |
| CMP-3.1.1 | high | Rendite-Rechner: Caching-Strategie (R-5.9) |
| CMP-8.2.1 | high | PDF-Generierung: Headless-Browser-Performance (R-5.7) |
| CMP-2.1.1 | medium | PSD2-Sync: Background-Job-Queue (R-5.8) |
| CMP-8.1.1 | medium | Dashboard: LCP-Optimierung (R-5.5) |
| CMP-7.1.1 | medium | Elasticsearch: Query-Performance fuer Typeahead |

---

## Verification Criteria

- [ ] Lasttests: 50.000 concurrent Requests bei < 200ms P95 (CRUD)
- [ ] Monte-Carlo-Simulation: 1000 Pfade in < 5s (6-Positionen-Portfolio)
- [ ] Lighthouse Performance Score >= 90 (Desktop), >= 75 (Mobile)
- [ ] PDF-Generierung: 10 Reports parallel in < 10s pro Report
- [ ] Auto-Scaling: Pod-Count verdoppelt sich bei Lastspitze innerhalb 60s

---

## Tooling / Automation

| Tool | Checks | Automated |
|---|---|---|
| k6 / Artillery | API-Lasttests, Latenzmessung | yes (CI nightly) |
| Lighthouse CI | Core Web Vitals | yes (CI) |
| Prometheus + Grafana | Runtime-Performance-Monitoring | yes |
| Redis / Node-Cache | Rendite-Cache, Session-Cache | yes |
| Kubernetes HPA | Auto-Scaling | yes |
