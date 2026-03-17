---
type: ADR
id: ADR-1
title: "Candidate Pool Opt-In Model"
status: approved
version: "1.0"
date: "2025-07-14"
---

# ADR-1: Candidate Pool Opt-In Model

## Status

Accepted

## Context

Prospect needs a pool of tenant candidates who can be matched to owner search requests. There are two fundamental approaches: (1) any user can be added to the pool automatically when they complete TrustGate verification, or (2) candidates must explicitly opt in to the Prospect pool with separate consent.

The automatic approach maximizes pool size but raises GDPR concerns (purpose limitation), creates user surprise, and conflates TrustGate's verification purpose with Prospect's matching purpose.

## Decision

Prospect adopts an explicit opt-in model. Candidates must:
1. Hold at least one active TrustGate badge (prerequisite).
2. Create a separate Prospect matching profile with location, budget, and preferences.
3. Grant Prospect-specific data processing consent (separate from TrustGate consent).

Pool profiles can be paused or deleted at any time without affecting TrustGate badge status.

## Consequences

- **Pool size:** Initially smaller than automatic enrollment. Mitigated by onboarding flow that highlights Prospect benefits during TrustGate completion.
- **GDPR compliance:** Clear purpose limitation and consent separation. Each service processes data under its own legal basis.
- **User control:** Candidates control their presence in the matching pool independently.
- **Data architecture:** Prospect stores its own profile records with a foreign key to TrustGate subject ID, but no shared database.