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

Primary relational data store for all Relay domain entities: listings, criteria catalogs, candidacies, approval records, decisions, cancellations, and the append-only audit table.

## Specification

| Property | Value |
|---|---|
| Engine | PostgreSQL 16+ |
| Hosting | Managed service (e.g., AWS RDS, Supabase) |
| High Availability | Multi-AZ with synchronous replication for audit table |
| Backup | Automated daily snapshots, 30-day retention, PITR enabled |
| Encryption | At rest (AES-256), in transit (TLS 1.3) |

## Schema Highlights

- Append-only `audit_events` table with hash chain column and no UPDATE/DELETE grants.
- `listings` table with state machine column (draft, approved, published, decision-pending, completed, cancelled).
- `criteria_catalogs` table with locked flag and immutability trigger.
- `candidacies` table with JSONB verification snapshot column.
- Row-level security for multi-tenant isolation.

## Scaling

- Read replicas for search and reporting queries.
- Connection pooling via PgBouncer.
- Table partitioning on audit_events by month.