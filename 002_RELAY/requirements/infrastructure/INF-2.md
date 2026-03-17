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

In-memory data store for real-time ranking caches, TrustGate response caching, session management, and rate limiting.

## Specification

| Property | Value |
|---|---|
| Engine | Redis 7+ |
| Hosting | Managed service (e.g., ElastiCache, Upstash) |
| Persistence | RDB snapshots every 5 minutes |
| Eviction | LRU for cache entries |
| Encryption | In transit (TLS) |

## Key Patterns

- `ranking:{listingId}` — Sorted set of candidate IDs by score.
- `trustgate:cache:{candidateId}` — Cached verification status (TTL: 5 min).
- `ratelimit:{userId}:{endpoint}` — Rate limit counters.