---
type: Infrastructure
id: INF-5
title: "Notification Infrastructure"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-5: Notification Infrastructure

## Purpose

Multi-channel notification delivery system for email, in-app, and push notifications.

## Specification

| Channel | Provider | Fallback |
|---|---|---|
| Email | Postmark or AWS SES | Queue + retry (3x exponential backoff) |
| In-App | Custom notification inbox (PostgreSQL + WebSocket) | Polling fallback |
| Push | FCM / APNs (future phase) | In-app fallback |

## SLA Requirements

- Email delivery within 60 seconds of trigger for critical notifications (candidacy confirmation, acceptance).
- In-app delivery within 5 seconds via WebSocket.
- Retry policy: 3 retries with exponential backoff (1s, 4s, 16s).

## Templating

- Templates stored in version-controlled repository.
- Variables: `{{listingTitle}}`, `{{candidateName}}`, `{{actionUrl}}`, etc.
- Language: English (single-language MVP).