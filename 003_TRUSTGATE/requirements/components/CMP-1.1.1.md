---
type: Component
id: CMP-1.1.1
title: "Order Service"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.1
functions:
  - FN-1.1.1.1
  - FN-1.1.1.2
---

# CMP-1.1.1: Order Service

## Responsibility

The Order Service is responsible for managing the lifecycle of verification orders. The system shall accept order creation requests from B2B clients via API, validate check module selection against available packages, enforce consent prerequisites, generate unique order reference IDs, and track orders through their lifecycle (created, in-progress, partially-complete, complete, expired, cancelled). The system shall enforce per-client rate limits and support both pre-configured packages and custom module combinations.

## Interfaces

- **Inbound:** B2B Client API (order creation, status query), Internal modules (Relay, Prospect)
- **Outbound:** Consent Service (consent validation), Identity Engine (identity checks), Income Engine (income checks), Credit Orchestrator (credit checks), Notification Service (status updates), Audit Service (order events)

## Functions

| ID | Title |
|---|---|
| FN-1.1.1.1 | Create Verification Order |
| FN-1.1.1.2 | Track Order Status |

## Constraints

- Orders require valid consent for all mandatory check modules before processing.
- Rate limits enforced per B2B client (configurable, default 100 req/min).
- Order reference IDs are UUIDs; no sequential patterns.

## Infrastructure References

- INF-1 (PostgreSQL — order records)
- INF-2 (Redis — rate limiting)