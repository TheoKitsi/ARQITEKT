---
id: "BC-1"
type: BusinessCase
title: "Prospect: Owner-Paid Qualified Tenant Search"
status: draft
version: "1.0"
date: "2025-07-14"
owner: "kitsi"
---

# Prospect: Owner-Paid Qualified Tenant Search

## Business Objective

Prospect is a platform where **property owners find verified tenants** through criteria-based matching. Unlike Relay (tenant-initiated successor search), Prospect is owner-initiated: landlords create search requests defining their ideal tenant profile, and the system matches them with pre-verified candidates from TrustGate.

Prospect solves the problem of landlords spending weeks reviewing unverified applications. By leveraging TrustGate-verified candidate pools and criteria-based matching, Prospect delivers shortlists of qualified, verified tenants to landlords within hours.

## Scope

### In Scope

- Landlord search request creation with criteria definition
- Integration with TrustGate verified candidate pool
- Criteria-based matching and candidate ranking
- Shortlist delivery and landlord review workflow
- Viewing scheduling between landlord and candidates
- Lease decision tracking and handover completion
- Owner-paid pricing model

### Out of Scope

- Tenant-initiated successor search (Relay module)
- Identity/income/credit verification (TrustGate module)
- Lease contract generation
- Property management features
- Rent payment processing

## Target Audience

| Role | Description |
|---|---|
| Property Owner | Landlord seeking a qualified tenant for a vacant unit |
| Verified Candidate | TrustGate-verified user open to tenant search matches |
| Property Manager | Agent managing searches on behalf of multiple owners |
| Platform Operator | Admin overseeing matching quality and compliance |

## Core Principles

1. **Verification first** — Only TrustGate-verified candidates enter the matching pool
2. **Owner control** — Landlord defines criteria and makes all decisions
3. **Efficiency** — Shortlist delivered within 24 hours of search creation
4. **Fair matching** — Algorithm-based ranking with transparent criteria
5. **Privacy** — Candidates only see landlord contact after mutual match
6. **Quality over quantity** — Small, highly qualified shortlists instead of mass applications

## Monetization

- Per-search fee (paid by landlord)
- Premium tier: priority matching, extended candidate pool, dedicated support
- Success fee on confirmed lease (optional)

## Success Criteria

| KPI | Target |
|---|---|
| Shortlist delivery time | < 24 hours |
| Landlord satisfaction with shortlist quality | > 80% |
| Shortlist-to-lease conversion | > 40% |
| Average candidates per shortlist | 5-10 |
| Candidate verification rate | 100% (enforced) |
| Viewing-to-decision ratio | > 60% |

## Requirements Tree-Map

- **SOL-1:** Owner Tenant Search Platform
  - US-1.1: Search Request Creation
  - US-1.2: Candidate Pool Integration
  - US-1.3: Criteria-Based Matching
  - US-1.4: Shortlist Delivery
  - US-1.5: Viewing Scheduling
  - US-1.6: Lease Decision Tracking
- **INF-1 to INF-6:** Cross-Cutting Infrastructure
- **NTF-1 to NTF-2:** Notifications
- **ADR-1:** Candidate Pool Opt-In Model

## Glossary

| Term | Definition |
|---|---|
| Search Request | A landlord's specification for finding a qualified tenant |
| Candidate Pool | Set of TrustGate-verified users who have opted in to be matched |
| Matching Score | Similarity score between a candidate's profile and search criteria |
| Shortlist | Curated list of top matching candidates delivered to the landlord |
| Viewing | Scheduled property visit between landlord and candidate |
| Lease Decision | Landlord's formal selection of a tenant from the shortlist |
| Property Manager | Agent creating and managing searches on behalf of landlords |