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
In-memory data store for session management, rate limiting, cooldown timers,
matching score caching, and real-time presence indicators.

## Specification
| Property | Value |
|---|---|
| Engine | Redis 7+ |
| Hosting | Managed service (e.g., AWS ElastiCache, Upstash) |
| Persistence | AOF with fsync every second |
| Encryption | TLS in transit, encryption at rest |
| Eviction | allkeys-lru for cache namespace, noeviction for session namespace |

## Key Namespaces
- `session:{userId}` — authenticated session tokens with sliding expiry.
- `cooldown:{userId}` — deceleration state with TTL matching cooldown duration (SOL-11).
- `match-cache:{pairHash}` — pre-computed matching scores with 24h TTL.
- `rate:{userId}:{action}` — sliding window rate limits for contact requests.
- `seriousness:{userId}` — cached seriousness score updated on write-through.

## Scaling
- Redis Cluster mode for horizontal scaling.
- Separate logical databases for cache vs. session data.
- Pub/Sub channels for real-time notification fanout.
