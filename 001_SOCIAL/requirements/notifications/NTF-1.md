---
type: Notification
id: NTF-1
title: "Matching & Consent Notifications"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-1: Matching & Consent Notifications

## Trigger Events
| Event | Recipients | Channels | SLA |
|---|---|---|---|
| New match proposal available | Target user | Push, In-App | Immediate |
| Consent request received (SOL-5) | Target user | Push, Email, In-App | Immediate |
| Consent granted — contact unlocked | Both users | Push, In-App | Immediate |
| Consent declined | Requesting user | In-App | Immediate |
| Weekly match digest | Active users | Email | Sunday 10:00 local |
| Compatibility reflection ready (SOL-9) | Both users | In-App | Within 1h of match |

## Content Requirements
- All notifications shall include the matched user's display name and compatibility score.
- Consent notifications must clearly state the action required and include a deep link.
- Weekly digest includes top 3 new matches with brief funnel-level compatibility summary.
- No profile photos in email notifications (privacy by default, DSGVO).

## Delivery Requirements
- Email delivery via transactional email provider (INF-5).
- In-app notifications stored in notification inbox with read/unread status.
- Push notifications respect user quiet hours configuration.
- Retry policy: 3 retries with exponential backoff for failed deliveries.
