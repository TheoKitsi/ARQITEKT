---
type: Component
id: CMP-3.1
title: Webhook Dispatcher
status: draft
parent: US-3.1
---

# CMP-3.1 — Webhook Dispatcher

## Responsibility
Dispatches signed webhook payloads to registered URLs with retry logic and delivery logging.

## Technology
Background job queue (Bull/BullMQ) with HMAC-SHA256 signing.

## Interfaces
- Methods: `dispatch(event, tenantId)`, `registerHook(url, events)`, `getDeliveryLog(hookId)`
- Retry: exponential backoff, max 5 attempts
