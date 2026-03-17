---
type: ADR
id: ADR-1
title: "Role and Payment Model Separation"
status: draft
version: "1.0"
date: "2025-07-14"
---

# ADR-1: Role and Payment Model Separation

## Status

Accepted.

## Context

Relay serves three distinct roles (listing tenant, candidate, landlord) with different interaction patterns and trust requirements. The monetization model (listing fees, premium options, handover fees) must be cleanly separated from the core matching and decision logic to allow independent evolution of pricing without impacting functional requirements.

## Decision

The system shall implement a strict separation between the role-based business logic (listing, candidacy, decision) and the payment/billing domain. Payment processing is out of scope for Relay's functional requirements. When billing integration is needed, it will be handled by a dedicated Billing Service with its own data store, accessed via a well-defined API contract. Relay shall emit billing-relevant events (listing published, handover completed) but shall not enforce payment as a precondition for functional workflows in the current version.

## Consequences

### Positive
- Core matching logic is independent of pricing changes.
- Each role's workflow can evolve independently.
- Billing Service can be shared across Relay, TrustGate, and Prospect.

### Negative
- First version does not enforce payment, requiring manual invoicing or a follow-up integration phase.
- Event schema must be designed with future billing needs in mind.

### Risks
- Delayed billing integration may impact revenue realization.
- Event schema evolution must be managed carefully (versioning, backward compatibility).