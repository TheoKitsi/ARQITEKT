---
type: Infrastructure
id: INF-3
title: "Object Storage"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-3: Object Storage

## Purpose

S3-compatible object storage for landlord approval documents, audit export files, and any future file attachments.

## Specification

| Property | Value |
|---|---|
| Provider | S3-compatible (AWS S3, MinIO, Cloudflare R2) |
| Encryption | Server-side AES-256 |
| Access | Pre-signed URLs with 15-minute expiry for reads |
| Retention | Approval documents: 10 years minimum; Export files: 7 days |
| Versioning | Enabled for approval documents |

## Bucket Structure

- `relay-approvals/{listingId}/{documentId}` — Approval documents.
- `relay-exports/{exportId}` — Audit export files.