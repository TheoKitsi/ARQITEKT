---
type: Notification
id: NTF-2
title: "Profile & Verification Notifications"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-2: Profile & Verification Notifications

## Trigger Events
| Event | Recipients | Channels | SLA |
|---|---|---|---|
| Identity verification successful (SOL-1) | User | Push, Email, In-App | Immediate |
| Identity verification failed | User | Email, In-App | Immediate |
| Funnel level unlocked (SOL-2) | User | Push, In-App | Immediate |
| Profile staged release advanced (SOL-16) | Matched partners | In-App | Within 1h |
| Seriousness score updated (SOL-13) | User | In-App | Immediate |
| Personality assessment results ready (SOL-10) | User | Push, In-App | Immediate |
| Onboarding progress reminder (SOL-8) | User | Email | 48h after last activity |

## Content Requirements
- Verification notifications shall include next steps on failure (re-upload, support contact).
- Funnel unlock notifications celebrate progress and preview the next level's theme.
- Staged release notifications inform matched partners of newly visible profile sections.
- Seriousness score updates include the delta and contributing factors.

## Delivery Requirements
- Verification failure emails include a secure deep link for re-submission.
- Onboarding reminders capped at 3 total per user to avoid fatigue.
- All notifications respect per-category unsubscribe preferences (DSGVO).
- Push delivery via FCM/APNs (INF-5).
