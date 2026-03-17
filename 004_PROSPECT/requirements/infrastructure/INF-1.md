---
type: Infrastructure
id: INF-1
title: "PostgreSQL Database"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-1: PostgreSQL Database

## Purpose

Primary relational data store for all Prospect domain entities.

## Specification

- **Engine:** PostgreSQL 16+ with PostGIS extension
- **Deployment:** Managed service (AWS RDS or equivalent)
- **High Availability:** Multi-AZ with automatic failover
- **Storage:** GP3, auto-scaling, encrypted at rest (AES-256)
- **Backup:** Automated daily snapshots, 30-day retention, point-in-time recovery

## Key Schemas

- `searches` — Search requests, criteria, status
- `pool_profiles` — Candidate matching profiles
- `matches` — Matching results, scores, shortlists
- `viewings` — Viewing slots, attendance, notes (notes encrypted)
- `decisions` — Lease decisions, closure records
- `consents` — Prospect-specific data consent records
- `audit_log` — All state transitions

## Performance Targets

- Read latency: < 10 ms (p95)
- Write latency: < 20 ms (p95)
- Connection pool: 50-200 connections

## Access Control

- Application role: read/write on domain schemas
- Audit role: append-only on audit_log
- DBA role: schema management, no production data access without approval