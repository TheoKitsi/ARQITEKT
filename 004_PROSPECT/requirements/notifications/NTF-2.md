---
type: Notification
id: NTF-2
title: "Platform Operator Alerts"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-2: Platform Operator Alerts

## Purpose

Alert Prospect platform operators about system health and operational events.

## Triggers and Recipients

| Event | Recipient | Channel | Severity |
|---|---|---|---|
| Matching SLA breach (> 30 min) | Ops team | Slack, Email | High |
| Badge sync failure (3+ cycles) | Ops team | Slack, PagerDuty | Critical |
| Geocoding service outage | Ops team | Slack | High |
| Search volume spike (> 2x baseline) | Ops team | Slack | Medium |
| Shortlist delivery SLA breach | Ops team | Slack, Email | High |
| Data subject request received | DPO | Email | Medium |

## Escalation Rules

- Critical alerts: PagerDuty with 5-minute acknowledgement SLA.
- High alerts: Slack + email, 30-minute response target.
- Medium alerts: Slack only, next-business-day response.

## Infrastructure References

- INF-3 (Notification service)
- INF-6 (Monitoring and alerting)