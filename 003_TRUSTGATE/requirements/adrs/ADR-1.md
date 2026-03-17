---
type: ADR
id: ADR-1
title: "Badge-Only Data Sharing Model"
status: draft
version: "1.0"
date: "2025-07-14"
---

# ADR-1: Badge-Only Data Sharing Model

## Status

Accepted.

## Context

TrustGate processes sensitive personal data (identity documents, income records, credit reports). Downstream consumers (Relay, Prospect, B2B clients) need to make trust-based decisions but do not need — and should not have access to — raw personal data.

## Decision

TrustGate shall expose only badge statuses and composite scores to external consumers. Raw data (exact income, credit report details, identity document content) shall never leave TrustGate's data boundary. All external APIs return privacy-preserving representations only.

## Consequences

### Positive
- Minimizes data exposure surface (GDPR data minimization principle).
- Reduces liability for downstream consumers.
- Simplifies consent management (consumers get badges, not data).

### Negative
- Consumers cannot reinterpret raw data for custom scoring.
- Badge granularity must be sufficient for all downstream use cases.

### Risks
- Badge model may need refinement as new use cases emerge.