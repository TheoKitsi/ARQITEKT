---
type: infrastructure
id: INF-7
title: "CI/CD und Deployment"
status: draft
version: "1.0"
date: "2026-03-15"
category: "CI_CD"
crossCutting: true
constrains: [all]
---

# INF-7: CI/CD und Deployment

> **Category**: CI/CD
> **Cross-Cutting**: Applies to all relevant requirements

---

## Infrastructure Description

Vollautomatisierte Build-, Test- und Deployment-Pipeline via GitHub Actions. Trunk-Based Development mit Feature-Flags. Drei Umgebungen: Development, Staging, Production. Container-basiertes Deployment auf Kubernetes. Infrastructure-as-Code mit Terraform.

---

## Non-Functional Constraints

| Rule-ID | Rule | Source | Mandatory |
|---|---|---|---|
| R-7.1 | CI-Pipeline: Lint, Unit-Tests, Integration-Tests, Security-Scan bei jedem Push | DevOps | yes |
| R-7.2 | Deployment: Zero-Downtime via Rolling Updates / Blue-Green | SLA | yes |
| R-7.3 | Environments: dev (auto-deploy main), staging (manual promote), prod (manual approve) | DevOps | yes |
| R-7.4 | Container: Docker-Images mit Multi-Stage Builds, Distroless Base | Security | yes |
| R-7.5 | Infrastructure-as-Code: Terraform fuer alle Cloud-Ressourcen | DevOps | yes |
| R-7.6 | Feature-Flags: LaunchDarkly oder Unleash fuer schrittweisen Rollout | Architektur | yes |
| R-7.7 | Database-Migrations: Automatisch bei Deployment, Rollback-faehig | DevOps | yes |
| R-7.8 | Monitoring: Health-Checks, Alerting bei Error-Rate > 1% oder Latenz P95 > SLA | DevOps | yes |
| R-7.9 | Logging: Strukturiertes JSON-Logging, zentralisiert in ELK/Loki | DevOps | yes |
| R-7.10 | Backup: Taegliches DB-Backup, Point-in-Time-Recovery, 30 Tage Retention | DevOps | yes |

---

## Affected Requirements

| Requirement | Relevance | Note |
|---|---|---|
| SOL-10 | high | Feature-Flags pro Mandant (R-7.6) |
| FN-10.1.1.2 | high | Feature-Flag-Konfiguration implementiert R-7.6 |
| CMP-9.1.1 | high | Audit-Logger: Strukturiertes Logging (R-7.9) |
| all | high | Alle Komponenten durchlaufen CI-Pipeline |

---

## Verification Criteria

- [ ] CI-Pipeline: < 10min fuer vollstaendigen Build + Test-Lauf
- [ ] Zero-Downtime-Deployment: Keine 5xx-Fehler waehrend Deployment (Lasttest)
- [ ] Rollback: Vorherige Version wiederherstellbar innerhalb 5min
- [ ] DB-Backup: Recovery-Test monatlich erfolgreich
- [ ] Alerting: Slack-Notification bei Error-Rate > 1% innerhalb 30s

---

## Tooling / Automation

| Tool | Checks | Automated |
|---|---|---|
| GitHub Actions | CI/CD Pipeline | yes |
| Docker + Kubernetes | Container-Orchestrierung | yes |
| Terraform | Infrastructure-as-Code | yes |
| Unleash / LaunchDarkly | Feature-Flag-Management | yes |
| Prometheus + Grafana + PagerDuty | Monitoring + Alerting | yes |
| ELK Stack / Grafana Loki | Zentrales Logging | yes |
| pg_dump + WAL Archiving | Database Backup + PITR | yes |
