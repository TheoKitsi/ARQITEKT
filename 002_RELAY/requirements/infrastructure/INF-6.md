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

Background job scheduler for deadline enforcement, data retention, and periodic monitoring tasks.

## Specification

| Property | Value |
|---|---|
| Engine | BullMQ on Redis or pg-boss on PostgreSQL |
| Monitoring | Job dashboard with success/failure metrics |
| Alerting | Failed job alerts via NTF-3 |

## Scheduled Tasks

| Job | Schedule | Description |
|---|---|---|
| Decision deadline check | Hourly | Identify listings past decision deadline; notify tenant |
| Landlord approval reminder | Daily | Remind landlords with pending approval requests > 7 days |
| Auto-cancel stale drafts | Daily | Cancel listings in draft > 30 days without approval |
| Cancellation counter cleanup | Monthly | Archive counters older than 12 months |
| Export file cleanup | Daily | Delete export files older than 7 days |
| Audit partition management | Monthly | Create next month's partition; archive old partitions |