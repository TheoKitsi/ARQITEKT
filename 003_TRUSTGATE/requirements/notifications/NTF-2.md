---
type: Notification
id: NTF-2
title: "Consent and Expiration Notifications"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-2: Consent and Expiration Notifications

## Trigger Events

| Event | Recipients | Channels | SLA |
|---|---|---|---|
| Consent revocation processed | Affected B2B Client | Email, Webhook | < 1 hour |
| Badge expiring (30 days) | End User, Ordering Client | Email, In-App | Daily batch |
| Badge expired | End User, Ordering Client | Email, In-App | Immediate |
| Re-check available | End User | Email, In-App | Immediate |
| Data subject request completed | End User | Email, In-App | < 5 min |

## Content Requirements

- Expiration notifications include badge type, expiration date, and re-verification link.
- Consent revocation notifications to B2B clients include which data types are no longer accessible.
- Data subject request notifications include request type and completion status.