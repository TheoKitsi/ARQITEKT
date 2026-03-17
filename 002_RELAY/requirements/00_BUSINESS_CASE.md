---
id: "BC-1"
type: BusinessCase
title: "Relay: Verified Successor Tenant Search"
status: draft
version: "1.0"
date: "2025-07-14"
owner: "kitsi"
---

# Relay: Verified Successor Tenant Search

## Business Objective

Relay is a platform for **verified successor tenant search**. When a tenant moves out, they can initiate a structured process to find and nominate a qualified successor. The landlord retains full approval rights, candidates must pass verification before applying, and all decisions are auditable.

Relay solves the problem of opaque, trust-deficient tenant handovers by introducing verification-first candidacy, transparent criteria, and a rule-based decision workflow.

## Scope

### In Scope
- Landlord approval before listing publication
- Criteria catalog (system + custom) for each listing
- Verified candidacy (only verified users can apply)
- Qualification-based ranking with configurable weights
- Landlord decision workflow with automatic runner-up promotion
- Exceptional cancellation with documented reasons
- Badge-based candidate comparison (privacy-preserving)
- Audit trail for every process step

### Out of Scope
- Identity verification itself (handled by TrustGate module)
- Landlord-initiated tenant search (handled by Prospect module)
- Payment processing / rent handling
- Lease contract generation
- Property management features

## Target Audience

| Role | Description |
|---|---|
| Listing Tenant | Current tenant seeking a successor |
| Candidate | Verified user applying for a listing |
| Landlord | Property owner approving/deciding successor |
| Platform Operator | Admin overseeing compliance, disputes |

## Core Principles

1. **Verification before participation** — No candidacy without valid verification status
2. **Landlord sovereignty** — Landlord retains approval and decision rights
3. **Transparency** — Criteria visible before candidacy, ranking logic documented
4. **Data minimization** — Badge/Score display instead of raw personal data
5. **Auditability** — Every step immutably logged
6. **Fairness** — Rule-based ranking, no hidden preferences

## Monetization

- Listing fee (per listing published)
- Premium options (featured listing, extended candidacy period)
- Platform fee on successful handover (optional)

## Success Criteria

| KPI | Target |
|---|---|
| Listing-to-handover conversion | > 60% |
| Average time from listing to decision | < 21 days |
| Landlord approval rate | > 80% |
| Candidate verification rate | 100% (enforced) |
| Dispute rate | < 2% |

## Requirements Tree-Map

- **SOL-1:** Successor Search Platform
  - US-1.1: Landlord Approval Before Listing
  - US-1.2: Criteria Catalog
  - US-1.3: Verified Candidacy
  - US-1.4: Qualification-Based Ranking
  - US-1.5: Landlord Decision and Runner-Up
  - US-1.6: Exceptional Cancellation
  - US-1.7: Badge-Based Candidate View
  - US-1.8: Audit Trail
- **INF-1 to INF-7:** Cross-Cutting Infrastructure
- **NTF-1 to NTF-3:** Notifications
- **ADR-1:** Role and Payment Model Separation

## Glossary

| Term | Definition |
|---|---|
| Listing | A published successor search for a specific rental unit |
| Listing Tenant | The current tenant who initiates the successor search |
| Candidate | A verified user who applies for a listing |
| Landlord Approval | Documented permission from the landlord to publish the listing |
| Criteria Catalog | Set of system and custom criteria that candidates must satisfy |
| Badge | A privacy-preserving indicator of a verification result |
| Score | A composite qualification score derived from weighted criteria |
| Runner-Up | Next qualified candidate promoted when top candidate is rejected |
| Handover | Successful completion of the successor selection process |
| Cancellation | Exceptional termination of a listing with documented reason |
| Audit Trail | Immutable chronological record of all process steps |