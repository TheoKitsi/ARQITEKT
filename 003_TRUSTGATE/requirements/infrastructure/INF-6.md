---
type: Infrastructure
id: INF-6
title: "API Gateway"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-6: API Gateway

## Purpose

Central API gateway handling authentication, rate limiting, routing, and TLS termination for all TrustGate API endpoints.

## Specification

| Property | Value |
|---|---|
| Technology | Kong / AWS API Gateway / Traefik |
| Auth | OAuth 2.0 (client credentials for B2B, authorization code for end users) |
| Rate Limiting | Per-client configurable (default 100 req/min) |
| TLS | 1.3 minimum, HSTS enabled |
| Versioning | URL path versioning (/v1/, /v2/) |

## Endpoint Groups

- `/v1/orders/` — Verification order management (B2B)
- `/v1/results/` — Result retrieval (B2B)
- `/v1/webhooks/` — Webhook subscription management (B2B)
- `/v1/verify/` — End user verification flows
- `/v1/consent/` — Consent management (end user)
- `/v1/data-rights/` — Data subject requests (end user)