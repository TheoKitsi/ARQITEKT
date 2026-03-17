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

Primary relational data store for TrustGate: verification orders, badges, scores, consent records, audit trail, data subject requests, and B2B client configuration.

## Specification

| Property | Value |
|---|---|
| Engine | PostgreSQL 16+ |
| Hosting | Managed (AWS RDS / Supabase) |
| HA | Multi-AZ, synchronous replication for audit and consent tables |
| Backup | Daily snapshots, 30-day retention, PITR |
| Encryption | At rest (AES-256), in transit (TLS 1.3) |

## Schema Highlights

- Append-only `audit_events` table (no UPDATE/DELETE).
- Versioned `consent_records` table (immutable, new version per change).
- `badges` table with status, expiration, method, and snapshot columns.
- `verification_orders` table with state machine and per-module status.
- Row-level security for multi-tenant B2B isolation.