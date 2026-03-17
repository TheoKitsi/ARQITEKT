---
type: user-story
id: US-6.1
status: draft
parent: SOL-6
version: "1.0"
---

# US-6.1: Restricted Profile Changes After Initial Population

> **As a** platform operator **I want to** prevent core profile fields from being freely changed after initial population **so that** manipulation attempts are made more difficult and the seriousness of users is ensured.

## Acceptance Criteria

- [ ] AC-6.1.1: All mandatory fields of levels 1-3 are locked after initial population.
- [ ] AC-6.1.2: Locked fields can only be changed for a fee or within the subscription quota.
- [ ] AC-6.1.3: Optional fields (levels 4-5) can be changed at any time free of charge.
- [ ] AC-6.1.4: Limited free changes per time period are possible (e.g. 1 core field change per quarter).
- [ ] AC-6.1.5: Changes to security-relevant fields (e.g. name, location) trigger a re-verification.
- [ ] AC-6.1.6: All changes are recorded in an internal change log.

## Components

- CMP-6.1.1: Change Management Module