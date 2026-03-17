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
Primary relational data store for all SOCIAL domain entities: user profiles, funnel-level
assessments, matching scores, compatibility reflections, verification records, consent
states, personality assessments, seriousness scores, and the append-only audit table.

## Specification
| Property | Value |
|---|---|
| Engine | PostgreSQL 16+ |
| Hosting | Managed service (e.g., AWS RDS, Supabase) |
| High Availability | Multi-AZ with synchronous replication for audit table |
| Backup | Automated daily snapshots, 30-day retention, PITR enabled |
| Encryption | At rest (AES-256), in transit (TLS 1.3) |

## Schema Highlights
- `users` table with verification status, seriousness score, and active funnel level.
- `funnel_profiles` table with JSONB columns for each of the 5 funnel levels per user.
- `matching_scores` table linking user pairs with composite score and algorithm version.
- `consent_records` table for mutual-consent-before-contact (SOL-5).
- `cooldown_events` table tracking deceleration triggers and expiry timestamps (SOL-11).
- Append-only `audit_events` table with hash chain column and no UPDATE/DELETE grants.
- Row-level security for multi-tenant isolation and DSGVO compliance.

## Scaling
- Read replicas for matching algorithm query workloads.
- Connection pooling via PgBouncer.
- Table partitioning on audit_events and cooldown_events by month.
- JSONB GIN indexes on funnel profile columns for efficient search.
