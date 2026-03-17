---
type: UserStory
id: US-1.9
title: "Re-Check and Expiration Management"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.9.1
---

# US-1.9: Re-Check and Expiration Management

**As the** platform
**I want to** automatically detect expiring verifications and trigger re-checks
**So that** decisions are always based on current evidence

## Acceptance Criteria

- **AC-1.9.1:** The system shall assign a configurable validity period to each verification (default: identity 12 months, income 6 months, credit 3 months).
- **AC-1.9.2:** The system shall notify the user and the ordering client 30 days before a verification expires.
- **AC-1.9.3:** The system shall automatically create a re-check order when the user confirms re-verification.
- **AC-1.9.4:** The system shall transition expired badges to "expired" status and prevent them from contributing to valid composite scores.
- **AC-1.9.5:** The system shall maintain the historical badge record alongside the new badge after re-check.
- **AC-1.9.6:** The system shall support bulk expiration queries via API for B2B clients to check which of their subjects have upcoming expirations.