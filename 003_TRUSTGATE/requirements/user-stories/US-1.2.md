---
type: UserStory
id: US-1.2
title: "eID NFC Identification"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.2.1
---

# US-1.2: eID NFC Identification

**As an** end user
**I want to** verify my identity using my German eID card via NFC on my mobile device
**So that** I can quickly and securely obtain a verified identity badge

## Acceptance Criteria

- **AC-1.2.1:** The system shall provide a complete eID/NFC verification flow usable on iOS and Android devices with NFC capability.
- **AC-1.2.2:** The system shall integrate with the AusweisApp2 SDK for eID reading.
- **AC-1.2.3:** The system shall save a secure resumption state if the user interrupts the flow, allowing continuation within 30 minutes.
- **AC-1.2.4:** The system shall generate an identity badge with "verified" status and an expiration date (configurable, default 12 months) upon successful verification.
- **AC-1.2.5:** The system shall extract and store only the minimum required identity attributes (name, date of birth, nationality) in encrypted form.
- **AC-1.2.6:** The system shall detect NFC hardware absence and redirect the user to the alternative identification flow.
- **AC-1.2.7:** The system shall emit an audit event for each verification attempt (success or failure).