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

In-memory cache for pool profile indexing, badge state caching, and matching acceleration.

## Specification

- **Engine:** Redis 7+ (or managed equivalent)
- **Deployment:** Cluster mode with 3 shards
- **Memory:** 8 GB per shard (auto-scaling)
- **Persistence:** AOF with 1-second fsync
- **Encryption:** In-transit (TLS), at-rest (encrypted EBS)

## Key Patterns

- `pool:active:{region}` — Set of active candidate IDs per region
- `badge:{subjectId}` — Badge state snapshot, TTL 10 minutes
- `match:lock:{searchId}` — Distributed lock for matching runs
- `session:{userId}` — User session data, TTL 24 hours

## Performance Targets

- Read latency: < 1 ms (p95)
- Write latency: < 2 ms (p95)
- Cache hit ratio: > 95%

## Eviction Policy

- `allkeys-lru` for general keys
- Badge keys: explicit TTL, no LRU eviction