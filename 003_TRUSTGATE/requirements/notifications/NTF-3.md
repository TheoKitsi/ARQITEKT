---
type: Notification
id: NTF-3
title: "Platform Operator Alerts"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-3: Platform Operator Alerts

## Trigger Events

| Event | Recipients | Channels | SLA |
|---|---|---|---|
| Manual review queue > 50 items | Platform Operator | Dashboard, Email | < 15 min |
| Provider failure rate > 10% (1h window) | Platform Operator | PagerDuty, Email | Immediate |
| Data subject request overdue (>48h) | Platform Operator | Email | Immediate |
| B2B client webhook deactivated | Platform Operator | Dashboard | < 15 min |
| Anomalous order volume (>3x baseline) | Platform Operator | Dashboard, Email | < 30 min |

## Content Requirements

- Provider failure alerts include provider name, failure rate, and affected order count.
- Queue alerts include current queue depth and average wait time.