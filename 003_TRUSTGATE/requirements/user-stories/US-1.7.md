---
type: UserStory
id: US-1.7
title: "Consent and Data Release"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.7.1
---

# US-1.7: Consent and Data Release

**As an** end user
**I want to** control which verification results are shared with which recipients
**So that** my data is used purposefully and I maintain control over my personal information

## Acceptance Criteria

- **AC-1.7.1:** The system shall allow users to grant or deny consent per recipient and per data type (identity badge, income badge, credit badge, composite score).
- **AC-1.7.2:** The system shall store consent records as versioned, timestamped documents that are never overwritten.
- **AC-1.7.3:** The system shall prevent any external data query (credit check, data release) without valid consent on file.
- **AC-1.7.4:** The system shall allow users to revoke consent at any time, with revocation taking effect within 1 hour.
- **AC-1.7.5:** The system shall notify the affected B2B client when consent is revoked, including which data types are no longer accessible.
- **AC-1.7.6:** The system shall present consent requests in plain language, avoiding legal jargon, with clear descriptions of what data will be shared and with whom.