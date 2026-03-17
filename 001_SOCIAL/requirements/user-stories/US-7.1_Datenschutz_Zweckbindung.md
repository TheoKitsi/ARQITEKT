---
type: user-story
id: US-7.1
status: draft
parent: SOL-7
version: "1.0"
---

# US-7.1: Data Protection and Purpose Limitation

> **As a** user **I want to** be certain that my highly sensitive profile data is encrypted, purpose-bound, and processed in GDPR compliance **so that** I can use the platform with full confidence.

## Acceptance Criteria

- [ ] AC-7.1.1: All personal data is encrypted at rest (storage) and in transit (transmission).
- [ ] AC-7.1.2: Every data processing operation is assigned to a clearly defined purpose (GDPR Art. 5(1)(b)).
- [ ] AC-7.1.3: Consents are obtained granularly per processing purpose and can be individually revoked.
- [ ] AC-7.1.4: The user can request a complete disclosure of all stored data at any time and export it (GDPR Art. 15).
- [ ] AC-7.1.5: The user can delete their account; all personal data is completely and irreversibly removed (GDPR Art. 17).
- [ ] AC-7.1.6: All data accesses are logged and auditable.
- [ ] AC-7.1.7: Two-factor authentication is available and enforced for sensitive actions.
- [ ] AC-7.1.8: Suspicious activities (e.g. brute-force login, unusual location changes) are automatically detected.
- [ ] AC-7.1.9: Users can report abuse and fake profiles; reports are processed within a defined SLA.

## Components

- CMP-7.1.1: Data Protection Module
- CMP-7.1.2: Security Module