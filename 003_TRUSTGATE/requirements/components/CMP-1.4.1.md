---
type: Component
id: CMP-1.4.1
title: "Income Engine"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.4
functions:
  - FN-1.4.1.1
  - FN-1.4.1.2
---

# CMP-1.4.1: Income Engine

## Responsibility

The Income Engine is responsible for accepting, validating, and assessing income documentation. The system shall accept configurable document types (PDF payslips, tax returns, bank statements), run OCR extraction and automated plausibility checks (cross-field validation, amount consistency), flag inconsistencies for manual review, produce income badges with range brackets (never exact amounts), and auto-delete documents after the configured retention period.

## Interfaces

- **Inbound:** End User (document upload), Order Service (income check trigger)
- **Outbound:** OCR Service (document extraction), Manual Review Queue, Badge Service, Notification Service, Audit Service

## Functions

| ID | Title |
|---|---|
| FN-1.4.1.1 | Process Income Document |
| FN-1.4.1.2 | Run Plausibility Checks |

## Constraints

- Exact income amounts never stored or shared; only range brackets.
- Documents retained for active verification duration + 90 days, then auto-deleted.
- Plausibility check results stored separately from source documents.
- Manual review SLA: 24 hours.

## Infrastructure References

- INF-1 (PostgreSQL — income verification records)
- INF-3 (Encrypted storage — uploaded documents)
- INF-5 (OCR service)