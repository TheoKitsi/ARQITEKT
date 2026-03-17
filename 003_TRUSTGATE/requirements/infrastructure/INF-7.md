---
type: Infrastructure
id: INF-7
title: "Scheduled Jobs"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-7: Scheduled Jobs

## Purpose

Background job scheduler for badge expiration scanning, document retention cleanup, data subject request processing, and provider health monitoring.

## Specification

| Property | Value |
|---|---|
| Engine | BullMQ on Redis or pg-boss on PostgreSQL |
| Monitoring | Job dashboard with success/failure metrics |
| Alerting | Failed job alerts via NTF-3 |

## Scheduled Tasks

| Job | Schedule | Description |
|---|---|---|
| Badge expiration scan | Daily | Identify expiring badges, send notifications, transition expired |
| Document retention cleanup | Daily | Delete income documents past retention period |
| Data export cleanup | Daily | Delete download-ready exports older than 7 days |
| Provider health check | Every 5 min | Ping provider APIs, update circuit breaker state |
| Overdue request check | Hourly | Alert ops for data subject requests approaching 72h SLA |
| Re-check reminder | Daily | Re-notify users who have not re-verified after first expiration warning |