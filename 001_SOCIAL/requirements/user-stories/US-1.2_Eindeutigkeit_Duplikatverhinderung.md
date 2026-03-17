---
type: user-story
id: US-1.2
status: draft
parent: SOL-1
version: "1.0"
---

# US-1.2: Uniqueness / Duplicate Prevention

> **As a** platform operator **I want to** ensure that every real person has only one account **so that** fake profiles, multiple accounts, and manipulation are prevented.

## Acceptance Criteria

- [ ] AC-1.2.1: During ID upload, the system checks whether the ID data (hashed comparison) is already associated with an existing account.
- [ ] AC-1.2.2: On duplicate suspicion, registration is blocked and a support ticket is automatically created.
- [ ] AC-1.2.3: The user receives a clear error message when blocked.
- [ ] AC-1.2.4: ID data is stored exclusively as a hash — no plaintext storage of personal ID data.

## Components

- [CMP-1.2.1: Duplicate Detection Module](../components/CMP-1.2.1_Duplikat-Erkennungsmodul.md)