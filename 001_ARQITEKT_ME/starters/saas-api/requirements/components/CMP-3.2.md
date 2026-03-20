---
type: Component
id: CMP-3.2
title: Billing Service
status: draft
parent: US-3.2
---

# CMP-3.2 — Billing Service

## Responsibility
Manages subscription plans, usage metering, and payment provider webhook processing.

## Technology
Service layer with Stripe/Paddle SDK integration.

## Interfaces
- Methods: `getPlan(tenantId)`, `changePlan(tenantId, planId)`, `recordUsage(tenantId, metric, count)`
- Webhooks: processes `invoice.paid`, `subscription.updated` events
