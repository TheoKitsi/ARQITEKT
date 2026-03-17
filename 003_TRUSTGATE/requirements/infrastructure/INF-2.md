---
type: Infrastructure
id: INF-2
title: "Redis Cache"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-2: Redis Cache

## Purpose

In-memory store for rate limiting, provider response caching, session state, and verification flow resumption states.

## Specification

| Property | Value |
|---|---|
| Engine | Redis 7+ |
| Hosting | Managed (ElastiCache / Upstash) |
| Persistence | RDB snapshots every 5 min |
| Encryption | TLS in transit |

## Key Patterns

- `ratelimit:{clientId}:{endpoint}` — B2B rate limit counters.
- `provider:cache:{provider}:{subjectHash}` — Cached credit responses (TTL: 5 min).
- `eid:resume:{sessionId}` — eID resumption state (TTL: 30 min).