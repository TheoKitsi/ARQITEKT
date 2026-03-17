---
type: Component
id: CMP-1.8.1
title: "Result API"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.8
functions:
  - FN-1.8.1.1
  - FN-1.8.1.2
---

# CMP-1.8.1: Result API

## Responsibility

The Result API is responsible for providing B2B clients and internal modules with access to verification results. The system shall expose badge statuses, composite scores, validity periods, and order references via a versioned REST API. The system shall enforce multi-tenant isolation (clients access only their own orders or consented subjects), require OAuth 2.0 client credentials, enforce rate limits, return HTTP 403 for unauthorized data access, and support webhook callbacks for asynchronous delivery.

## Interfaces

- **Inbound:** B2B Client API (result queries, webhook registration), Internal modules (Relay, Prospect)
- **Outbound:** Badge Service (badge data), Score Engine (scores), Consent Service (access validation), Webhook delivery

## Functions

| ID | Title |
|---|---|
| FN-1.8.1.1 | Serve Verification Results |
| FN-1.8.1.2 | Manage Webhook Subscriptions |

## Constraints

- OAuth 2.0 client credentials required for all B2B access.
- Multi-tenant isolation: strict data boundary per client.
- Rate limit: configurable per client, default 100 req/min.
- Schema versioning mandatory (major.minor).

## Infrastructure References

- INF-1 (PostgreSQL — result records)
- INF-2 (Redis — rate limiting, response caching)
- INF-6 (API Gateway — auth, rate limiting, routing)