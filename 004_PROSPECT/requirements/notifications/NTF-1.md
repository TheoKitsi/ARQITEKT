---
type: Notification
id: NTF-1
title: "Search Lifecycle Events"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-1: Search Lifecycle Events

## Purpose

Notify owners and candidates about key search lifecycle transitions.

## Triggers and Recipients

| Event | Recipient | Channel | Timing |
|---|---|---|---|
| Search created | Owner | Email, Dashboard | Immediate |
| Matching complete | Owner | Email, Dashboard | On completion |
| Shortlist delivered | Owner | Email, Push, Dashboard | Within 24h |
| Match inquiry sent | Candidate | Email, Push | Immediate |
| Mutual match confirmed | Owner + Candidate | Email, Push | Immediate |
| Viewing booked | Owner + Candidate | Email, Push | Immediate |
| Viewing reminder | Owner + Candidate | Push | 24h before |
| Candidate selected | Chosen candidate | Email, Push | Immediate |
| Search completed | Non-selected candidates | Email | Within 1h |
| Search closed unfilled | All shortlisted | Email | Within 1h |

## Content Rules

- Email notifications must not contain candidate identity before mutual match.
- Push notifications use summary text only; detail on dashboard.
- All notifications include search reference ID.
- Unsubscribe link required for non-transactional notifications.

## Delivery Rules

- Transactional (match, booking): guaranteed delivery with retry.
- Informational (reminders, summaries): best-effort.
- Rate limit: max 5 notifications per user per hour.

## Infrastructure References

- INF-3 (Notification service)