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
Multi-channel notification delivery system supporting push, email, SMS, and in-app
notifications for all SOCIAL user touchpoints.

## Specification
| Property | Value |
|---|---|
| Email Provider | Transactional email service (Postmark, SES) |
| Push | FCM (Android), APNs (iOS) |
| SMS | Twilio or equivalent, opt-in only |
| In-App | WebSocket-backed notification inbox |
| Template Engine | MJML for email, Handlebars for in-app |

## Channel Configuration
- **Push**: Match proposals, consent responses, cooldown expiry.
- **Email**: Weekly match digest, verification status, account security events.
- **SMS**: Two-factor authentication, critical security alerts only.
- **In-App**: All events with read/unread state and action deep links.

## Delivery Requirements
- Retry policy: 3 retries with exponential backoff for failed deliveries.
- Quiet hours: configurable per user (default 22:00–08:00 local time).
- Unsubscribe handling per channel per notification category (DSGVO).
- Delivery receipts tracked for email open and push tap analytics.

## Scaling
- Message queue (SQS/RabbitMQ) for asynchronous dispatch.
- Dead-letter queue for permanently failed deliveries.
- Rate limiting per channel to prevent provider throttling.
