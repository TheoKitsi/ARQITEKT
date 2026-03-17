---
type: Notification
id: NTF-1
title: "Verification Lifecycle Notifications"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-1: Verification Lifecycle Notifications

## Trigger Events

| Event | Recipients | Channels | SLA |
|---|---|---|---|
| Verification order created | End User | Email, In-App | < 5 min |
| Identity verification complete | End User | Email, In-App | Immediate |
| Income verification complete | End User | Email, In-App | < 5 min |
| Credit check complete | End User | Email, In-App | < 5 min |
| All modules complete (order done) | End User, B2B Client | Email, In-App, Webhook | < 5 min |
| Verification failed | End User | Email, In-App | < 5 min |
| Manual review needed | End User | Email, In-App | < 1 hour |
| Manual review complete | End User | Email, In-App | < 5 min |

## Content Requirements

- All notifications include order reference ID and module type.
- Failure notifications include specific reason and next steps (retry, alternative method).
- Completion notifications include badge summary (status text, not raw data).