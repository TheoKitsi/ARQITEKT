---
type: Infrastructure
id: INF-6
title: "Scheduled Jobs"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-6: Scheduled Jobs

## Purpose

Cron-based background tasks for badge sync, search expiration, reminder dispatch, and data housekeeping.

## Specification

- **Scheduler:** Kubernetes CronJob or AWS EventBridge Scheduler
- **Execution:** Containerized Node.js workers
- **Concurrency:** Single-instance per job type (leader election via Redis lock)

## Job Definitions

| Job | Schedule | Description |
|---|---|---|
| badge-sync | Every 5 min | Sync TrustGate badge states (FN-1.2.1.2) |
| search-expiry | Daily 02:00 | Expire searches older than 30 days |
| viewing-reminder | Hourly | Send 24h viewing reminders |
| attendance-prompt | Daily 10:00 | Prompt owners for attendance recording |
| data-retention | Weekly Sun 03:00 | Archive records older than 3 years |
| analytics-aggregate | Daily 04:00 | Compute daily search/match/conversion metrics |

## Monitoring

- Job execution logged with duration, success/failure, and record counts.
- Failed jobs trigger NTF-2 operator alerts.
- Dead-letter queue for failed message processing.