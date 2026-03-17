---
type: Infrastructure
id: INF-3
title: "Encrypted Object Storage"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-3: Encrypted Object Storage

## Purpose

Encrypted storage for sensitive documents (income documents, identity attribute blobs) and data subject exports.

## Specification

| Property | Value |
|---|---|
| Provider | S3-compatible (AWS S3 / MinIO) |
| Encryption | Server-side AES-256 + client-side envelope encryption for identity data |
| Access | Pre-signed URLs (15 min expiry) |
| Retention | Income docs: active + 90 days; Identity blobs: badge lifetime; Exports: 7 days |
| Versioning | Disabled (documents are immutable until deletion) |

## Bucket Structure

- `trustgate-income/{orderId}/{documentId}`
- `trustgate-identity/{subjectId}/` (encrypted attribute blobs)
- `trustgate-exports/{requestId}`