---
type: Infrastructure
id: INF-7
title: "Identity Verification Service"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-7: Identity Verification Service

## Purpose
Third-party integration for verified registration and identity verification (SOL-1),
ensuring authentic user identities and reducing fraudulent accounts.

## Specification
| Property | Value |
|---|---|
| Provider | IDnow, Onfido, or equivalent KYC provider |
| Verification Types | Document (ID card, passport), liveness check, selfie match |
| Integration | REST API with webhook callbacks |
| Data Handling | Documents encrypted in transit and at rest, auto-purged after verification (DSGVO) |
| SLA | Verification result within 5 minutes (automated), 24h (manual review) |

## Verification Flow
- User uploads government ID + takes live selfie.
- Provider performs document authenticity check + facial match.
- Webhook callback updates user verification status in database.
- Verification badge displayed on profile with timestamp.

## Compliance
- DSGVO: verification documents purged 90 days post-verification.
- OWASP: API integration follows secure communication guidelines.
- Audit trail: all verification attempts logged in append-only audit table.

## Scaling
- Multiple provider fallback for high availability.
- Queue-based processing for peak load management.
- Cached verification status in Redis (INF-2) to avoid repeated lookups.
