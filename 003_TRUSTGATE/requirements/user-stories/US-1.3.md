---
type: UserStory
id: US-1.3
title: "Alternative Identification"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.3.1
---

# US-1.3: Alternative Identification

**As an** end user without eID capability
**I want to** use an alternative identification method
**So that** I can still achieve verified status despite technical limitations

## Acceptance Criteria

- **AC-1.3.1:** The system shall offer at least one alternative identification method (video-ident via certified provider).
- **AC-1.3.2:** The system shall transparently display the security level equivalence between eID and alternative methods.
- **AC-1.3.3:** The system shall produce the same badge model (status, expiration) regardless of the identification method used.
- **AC-1.3.4:** The system shall record the method used in the badge metadata for audit purposes.
- **AC-1.3.5:** The system shall support future addition of new identification methods without requiring core system changes (plugin architecture).
- **AC-1.3.6:** The system shall enforce the same data minimization rules as the eID flow.