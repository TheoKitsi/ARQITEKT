---
type: Notification
id: NTF-3
title: "Engagement & Moderation Alerts"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-3: Engagement & Moderation Alerts

## Trigger Events
| Event | Recipients | Channels | SLA |
|---|---|---|---|
| Cooldown activated (SOL-11) | User | Push, In-App | Immediate |
| Cooldown expired | User | Push, In-App | Immediate |
| Inactivity warning (SOL-14) | User | Email, In-App | After 14 days inactive |
| Account deactivation pending (SOL-14) | User | Email, SMS | After 30 days inactive |
| Feedback loop request (SOL-15) | User | In-App | 72h after match interaction |
| Exit interview invitation (SOL-17) | User | Email, In-App | On account deletion request |
| Suspicious activity detected | Platform operator | Email | Immediate |
| Daily platform health summary | Platform operator | Email | Daily 08:00 UTC |

## Content Requirements
- Cooldown notifications shall display remaining duration and reason.
- Inactivity warnings include a deep link to re-engage and preview of pending matches.
- Exit interview invitation is non-blocking — account deletion proceeds regardless.
- Operator alerts include user ID, event type, and recommended action.

## Delivery Requirements
- SMS used only for account deactivation pending (high-urgency, opt-in required).
- Feedback loop requests limited to 1 per match interaction.
- Operator alerts bypass quiet hours.
- All user-facing notifications include one-tap unsubscribe link (DSGVO).
