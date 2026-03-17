---
type: user-story
id: US-1.1
status: draft
parent: SOL-1
version: "1.0"
---

# US-1.1: Multi-Step Verification

> **As a** new user **I want to** verify myself through multiple steps (phone, email, ID document) **so that** I am confirmed as a trustworthy, real person and gain access to matching.

## Acceptance Criteria

- [ ] AC-1.1.1: The user can enter a mobile number and receives an SMS code for confirmation within 60 seconds.
- [ ] AC-1.1.2: The user can enter an email address and receives a confirmation link within 5 minutes.
- [ ] AC-1.1.3: The user can upload an ID document (national ID / passport); the system checks authenticity automatically, with manual review if unclear.
- [ ] AC-1.1.4: All three verification steps must be passed before the user appears in the matching pool.
- [ ] AC-1.1.5: The verification status is visible in the profile and cannot be faked.
- [ ] AC-1.1.6: Unverified users cannot create a profile and receive no match proposals.

## Components

- [CMP-1.1.1: Multi-Step Verification Module](../components/CMP-1.1.1_Mehrstufiges_Verifizierungsmodul.md)