---
type: ADR
id: ADR-2
title: "Provider Adapter Pattern for Extensibility"
status: draft
version: "1.0"
date: "2025-07-14"
---

# ADR-2: Provider Adapter Pattern for Extensibility

## Status

Accepted.

## Context

TrustGate integrates with external providers for identity verification (eID, video-ident) and credit checks (SCHUFA). The provider landscape may change, and new providers may be added.

## Decision

All external provider integrations shall follow an adapter pattern: each provider is implemented as a separate adapter behind a common interface. New providers can be added by implementing the interface without modifying core verification logic.

## Consequences

### Positive
- New providers added without core changes.
- Easy failover between providers.
- Unit testing via mock adapters.

### Negative
- Adapter interface must be generic enough for all provider types.
- Interface evolution requires coordination with existing adapters.