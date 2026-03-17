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
Stores user-uploaded media: profile photos (staged release per SOL-16), identity
verification documents, and personality assessment result exports.

## Specification
| Property | Value |
|---|---|
| Provider | S3-compatible (AWS S3, MinIO) |
| Redundancy | Cross-region replication for profile photos |
| Encryption | Server-side AES-256, client-side for verification documents |
| Retention | Profile photos: lifetime of account; verification docs: 90 days post-verification then purged (DSGVO) |
| Access | Pre-signed URLs with 15-minute expiry, no public buckets |

## Bucket Structure
- `profiles/{userId}/photos/` — staged visibility photos (blurred → full progression).
- `verification/{userId}/` — encrypted ID documents, auto-purged after verification.
- `exports/{userId}/` — DSGVO data export packages with 7-day download window.

## Scaling
- CDN distribution for profile photos via CloudFront or equivalent.
- Lifecycle policies for automatic cleanup of expired verification documents.
- Multipart upload for large media files.
