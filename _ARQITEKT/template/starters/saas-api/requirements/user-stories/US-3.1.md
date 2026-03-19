---
type: UserStory
id: US-3.1
title: Webhook Event Dispatch
status: draft
parent: SOL-3
---

# US-3.1 — Webhook Event Dispatch

As a tenant admin, I want to register webhook URLs so that my systems receive event notifications.

## Acceptance Criteria
1. Tenant can register webhook URLs for specific event types
2. Events are dispatched with signed payload (HMAC)
3. Failed deliveries retry with exponential backoff (max 5 attempts)
4. Webhook delivery logs are queryable via API
