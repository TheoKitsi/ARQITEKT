---
type: UserStory
id: US-1.5
title: "Credit Check Integration"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.5.1
---

# US-1.5: Credit Check Integration

**As the** platform
**I want to** retrieve credit reports from certified third-party providers
**So that** credit information is standardized, current, and audit-traceable

## Acceptance Criteria

- **AC-1.5.1:** The system shall execute credit checks only after receiving valid consent from the data subject.
- **AC-1.5.2:** The system shall integrate with at least one credit bureau (SCHUFA) via their certified API.
- **AC-1.5.3:** The system shall handle provider timeouts and outages by setting a "pending" badge status and retrying with exponential backoff.
- **AC-1.5.4:** The system shall record the provider name, request timestamp, and response timestamp for every credit inquiry.
- **AC-1.5.5:** The system shall produce a credit badge with status (positive, negative, pending, unavailable) derived from the provider response.
- **AC-1.5.6:** The system shall never store the full credit report; only the derived badge status and a provider reference ID are persisted.
- **AC-1.5.7:** The system shall support adding additional credit providers without core system changes.