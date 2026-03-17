---
type: Function
id: FN-1.4.1.1
title: "Process Income Document"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.4.1
---

# FN-1.4.1.1: Process Income Document

## Functional Description

- The system shall accept income document uploads (PDF payslips, tax returns, bank statements) from authenticated users.
- The system shall validate document format and size (max 20 MB per file, max 5 files per submission).
- The system shall store documents in encrypted object storage with a retention policy (active verification + 90 days).
- The system shall trigger OCR extraction to parse document content into structured data fields (employer name, gross/net amounts, period, currency).
- The system shall pass extracted fields to the plausibility check function.
- The system shall produce an income badge with status and range bracket upon completion.

## Preconditions

- User is authenticated and has an active income verification order.
- Valid consent for income verification on file.

## Behavior

1. User uploads income documents.
2. System validates format and size.
3. System stores in encrypted storage.
4. System triggers OCR extraction.
5. System passes to plausibility checks.
6. If checks pass: badge generated with "verified" status.
7. If checks flag issues: document routed to manual review.
8. System notifies user of result within 24 hours.

## Postconditions

- Documents stored with retention policy.
- Income badge generated (or manual review pending).
- Order module status updated.

## Error Handling

- The system shall return HTTP 415 if document format is unsupported.
- The system shall return HTTP 413 if file size exceeds 20 MB or file count exceeds 5.
- The system shall route OCR failures to manual review rather than rejecting.
- The system shall notify the user if manual review is needed, with expected timeline.