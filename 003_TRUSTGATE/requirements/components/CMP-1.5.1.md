---
type: Component
id: CMP-1.5.1
title: "Credit Orchestrator"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.5
functions:
  - FN-1.5.1.1
  - FN-1.5.1.2
---

# CMP-1.5.1: Credit Orchestrator

## Responsibility

The Credit Orchestrator is responsible for managing credit check requests to third-party providers. The system shall verify consent before any inquiry, integrate with SCHUFA (and future providers) via their certified APIs, handle timeouts with retry and "pending" badge status, record provider name and timestamps for every inquiry, produce credit badges (positive/negative/pending/unavailable) without storing full reports, and support adding new providers via a provider adapter pattern.

## Interfaces

- **Inbound:** Order Service (credit check trigger)
- **Outbound:** SCHUFA API (credit inquiry), Future Provider APIs, Consent Service (consent check), Badge Service, Audit Service

## Functions

| ID | Title |
|---|---|
| FN-1.5.1.1 | Execute Credit Check |
| FN-1.5.1.2 | Handle Provider Failover |

## Constraints

- No credit inquiry without valid consent on file.
- Full credit reports never stored; only derived badge status + provider reference ID.
- Provider adapter pattern for extensibility.
- Retry: 3 attempts with exponential backoff (5s, 20s, 60s).

## Infrastructure References

- INF-1 (PostgreSQL — credit check records)
- INF-2 (Redis — provider response caching, TTL: 5 min)