---
type: UserStory
id: US-1.4
title: "Income Verification"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.4.1
---

# US-1.4: Income Verification

**As the** platform
**I want to** verify income documentation in a structured process
**So that** downstream decision makers can reliably assess financial capacity

## Acceptance Criteria

- **AC-1.4.1:** The system shall accept income documents in configurable formats (PDF payslips, tax returns, bank statements) with configurable validity periods.
- **AC-1.4.2:** The system shall run automated plausibility checks on uploaded documents (OCR extraction, cross-field validation, amount consistency).
- **AC-1.4.3:** The system shall flag inconsistencies and route flagged documents to a manual review queue.
- **AC-1.4.4:** The system shall produce an income badge with status (verified, flagged, rejected) and a detail record (monthly net income range bracket, employment type).
- **AC-1.4.5:** The system shall never expose exact income amounts; only range brackets are stored and shared.
- **AC-1.4.6:** The system shall retain uploaded documents for the configured retention period (default: duration of active verification + 90 days), then auto-delete.
- **AC-1.4.7:** The system shall notify the user of the verification result within 24 hours of submission.