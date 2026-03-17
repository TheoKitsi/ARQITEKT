---
type: UserStory
id: US-1.2
title: "Candidate Pool Integration"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.2.1
---

# US-1.2: Candidate Pool Integration

**As a** verified candidate
**I want to** opt in to the matching pool with my preferences so that landlords can find me
**So that** I receive relevant property matches without manually searching and applying

## Acceptance Criteria

- **AC-1.2.1:** The system shall allow TrustGate-verified users to opt in to the candidate pool by creating a matching profile.
- **AC-1.2.2:** The system shall require a matching profile with: desired location (city/district/radius), budget range, preferred move-in date, unit size range, and availability status (active/paused).
- **AC-1.2.3:** The system shall synchronize the candidate's badge states from TrustGate in real time (or near real-time with max 5 min delay).
- **AC-1.2.4:** The system shall automatically exclude candidates with expired badges from active matching.
- **AC-1.2.5:** The system shall allow candidates to pause or deactivate their pool profile at any time.
- **AC-1.2.6:** The system shall require consent for Prospect matching separately from TrustGate verification consent.
- **AC-1.2.7:** The system shall not expose candidate identity to landlords until mutual match is confirmed.