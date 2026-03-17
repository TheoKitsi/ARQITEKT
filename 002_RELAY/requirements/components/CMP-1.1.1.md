---
type: Component
id: CMP-1.1.1
title: "Landlord Approval Gate"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.1
functions:
  - FN-1.1.1.1
  - FN-1.1.1.2
  - FN-1.1.1.3
---

# CMP-1.1.1: Landlord Approval Gate

## Responsibility

The Landlord Approval Gate is responsible for ensuring that no listing transitions from draft to published without documented landlord consent. The system shall accept landlord approval through two channels: direct document upload by the tenant (PDF, PNG, JPG, max 10 MB) and an in-app approval request workflow where the landlord receives a notification and responds digitally. The system shall validate document format and size, record the approval decision with timestamp, method, and landlord identity, and enforce the approval prerequisite at every publication attempt. The system shall also support approval revocation before the first candidacy is received.

## Interfaces

- **Inbound:** Listing Service (publication request), File Upload API (document), Landlord Response API (in-app decision)
- **Outbound:** Notification Service (approval request/revocation alerts), Audit Service (approval events), Document Storage (uploaded files)

## Functions

| ID | Title |
|---|---|
| FN-1.1.1.1 | Process Approval Document Upload |
| FN-1.1.1.2 | Handle In-App Approval Request |
| FN-1.1.1.3 | Revoke Landlord Approval |

## Constraints

- Document upload limited to PDF, PNG, JPG; max 10 MB per file.
- In-app approval links expire after 14 days.
- Approval revocation is only permitted before the first candidacy is received.
- All approval artifacts stored for minimum 10 years.

## Infrastructure References

- INF-1 (PostgreSQL — approval records)
- INF-3 (S3-compatible storage — uploaded documents)
- INF-5 (Notification infrastructure)