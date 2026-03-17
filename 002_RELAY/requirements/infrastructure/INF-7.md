---
type: Infrastructure
id: INF-7
title: "Archival Storage"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-7: Archival Storage

## Purpose

Long-term cold storage for audit data exceeding the active retention window, ensuring compliance with the 10-year record-keeping requirement.

## Specification

| Property | Value |
|---|---|
| Provider | S3 Glacier Deep Archive or equivalent |
| Encryption | AES-256 at rest |
| Access | Retrieval within 12 hours (acceptable for regulatory queries) |
| Retention | 10 years minimum per HGB requirements |
| Integrity | SHA-256 checksums verified on archive and retrieval |

## Archival Policy

- Audit data older than 2 years is migrated from PostgreSQL to archival storage.
- Migration preserves hash chain integrity by including chain metadata.
- Archived data remains queryable through the Export Audit Data function with extended retrieval SLA.