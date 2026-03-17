---
type: UserStory
id: US-1.1
title: "Landlord Approval Before Listing"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.1.1
---

# US-1.1: Landlord Approval Before Listing

**As a** listing tenant
**I want to** obtain and document my landlord's approval before publishing a successor search
**So that** the listing is legally grounded and the landlord is informed from the start

## Acceptance Criteria

- **AC-1.1.1:** The system shall require the tenant to upload a landlord approval document or trigger an in-app approval request before the listing can transition from draft to published.
- **AC-1.1.2:** The system shall validate that the uploaded document is a supported format (PDF, PNG, JPG) and does not exceed 10 MB.
- **AC-1.1.3:** The system shall send a notification to the landlord when an in-app approval request is created, including a direct link to approve or reject.
- **AC-1.1.4:** The system shall record the landlord's approval decision with timestamp, method (upload vs. in-app), and the landlord's identity reference.
- **AC-1.1.5:** The system shall block listing publication if no approval is on file and display a clear message explaining why.
- **AC-1.1.6:** The system shall allow the landlord to revoke approval at any time before the listing receives its first candidacy, triggering automatic unpublishing.