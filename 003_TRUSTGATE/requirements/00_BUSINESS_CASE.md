---
id: "BC-1"
type: BusinessCase
title: "TrustGate: Identity, Income, and Credit Verification as a Service"
status: draft
version: "1.0"
date: "2025-07-14"
owner: "kitsi"
---

# TrustGate: Identity, Income, and Credit Verification as a Service

## Business Objective

TrustGate is a **verification-as-a-service platform** that enables identity, income, and credit verification for both internal Messkraft modules (Relay, Prospect) and external B2B clients via API. TrustGate produces privacy-preserving badges and composite scores that downstream systems consume for trust-based decision making.

TrustGate solves the problem of fragmented, manual verification processes by providing a unified, consent-driven, API-first verification pipeline with configurable check modules, expiration management, and full GDPR compliance.

## Scope

### In Scope
- Verification order management with configurable check modules
- eID/NFC-based identity verification
- Alternative identity verification (video-ident, document upload)
- Income verification with document validation and plausibility checks
- Credit check integration with third-party providers (SCHUFA, Creditreform)
- Badge and composite score calculation
- Consent management and granular data release controls
- API for B2B result retrieval
- Verification lifecycle with expiration and re-check automation
- Data subject rights (access, correction, deletion)

### Out of Scope
- Tenant matching and ranking (Relay module)
- Landlord decision workflows (Relay module)
- Property search and listing (Prospect module)
- Payment and billing processing

## Target Audience

| Role | Description |
|---|---|
| End User | Person undergoing verification (tenant, applicant) |
| B2B Client | Company ordering verification via API (internal or external) |
| Decision Maker | Person viewing badges/scores to make trust decisions |
| B2B Integration Partner | External system consuming verification results via API |
| Data Subject | Any verified person exercising GDPR rights |
| Platform Operator | Admin managing verification infrastructure and compliance |

## Core Principles

1. **Consent first** — No verification or data sharing without explicit, granular consent
2. **Privacy by design** — Badges and scores instead of raw data; minimization at every layer
3. **API first** — Every capability accessible through versioned REST API
4. **Multi-tenancy** — B2B clients isolated at data and access level
5. **Auditability** — Every verification step and data access logged immutably
6. **Compliance** — GDPR, eIDAS, German Telemediengesetz, SCHUFA guidelines

## Monetization

- Per-verification pricing (tiered by check module count)
- Monthly subscription for B2B API access (volume tiers)
- Premium SLA options (expedited processing, priority support)

## Success Criteria

| KPI | Target |
|---|---|
| eID verification success rate | > 90% |
| Average verification turnaround | < 5 min (eID), < 24h (income) |
| API availability | 99.9% uptime |
| GDPR request response time | < 72 hours |
| B2B client onboarding time | < 1 business day |
| Consent revocation processing | < 1 hour |

## Requirements Tree-Map

- **SOL-1:** Verification Pipeline
  - US-1.1: Verification Order Management
  - US-1.2: eID NFC Identification
  - US-1.3: Alternative Identification
  - US-1.4: Income Verification
  - US-1.5: Credit Check Integration
  - US-1.6: Badge and Score Calculation
  - US-1.7: Consent and Data Release
  - US-1.8: API Result Retrieval
  - US-1.9: Re-Check and Expiration Management
  - US-1.10: Data Subject Rights
- **INF-1 to INF-7:** Cross-Cutting Infrastructure
- **NTF-1 to NTF-3:** Notifications
- **ADR-1 to ADR-2:** Architectural Decisions

## Glossary

| Term | Definition |
|---|---|
| Verification Order | A request to verify one or more aspects of a person's identity/finances |
| Check Module | An individual verification step (identity, income, credit) |
| Badge | A privacy-preserving status indicator for a verification result |
| Composite Score | A weighted aggregate of individual badge scores |
| Consent | Explicit, granular permission from a user to process specific data |
| Data Release | User-controlled sharing of verification results with a specific recipient |
| Re-Check | Automated re-verification triggered by approaching expiration |
| eID | German electronic identity card with NFC capability |
| SCHUFA | German credit bureau (Schutzgemeinschaft fuer allgemeine Kreditsicherung) |
| Data Subject | Person whose personal data is processed (GDPR terminology) |
| B2B Client | Business customer using TrustGate via API |
| Tenant | In multi-tenancy context: isolated B2B client workspace |