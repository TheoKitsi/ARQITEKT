---
type: Function
id: FN-1.8.1.2
title: "Search Audit Log"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.8.1
---

# FN-1.8.1.2: Search Audit Log

## Functional Description

- The system shall provide a search API for platform operators to query audit records.
- The system shall support filters by: listing ID, user ID, event type, entity type, and date range.
- The system shall support pagination (default page size 50, max 200).
- The system shall return results within 2 seconds for queries spanning up to 1 year of data.
- The system shall restrict access to platform operators with the "audit-viewer" role.

## Preconditions

- The caller is authenticated and has the "audit-viewer" role.

## Behavior

1. Operator submits search query with filters.
2. System validates filters and role.
3. System queries the append-only table with appropriate indices.
4. System returns paginated results.

## Postconditions

- The operator receives matching audit records.
- The query itself is logged as an audit event (meta-audit).

## Error Handling

- The system shall return HTTP 403 if the caller lacks the "audit-viewer" role.
- The system shall return HTTP 400 if filter values are malformed.
- The system shall return HTTP 504 (Gateway Timeout) if the query exceeds 5 seconds, suggesting narrower filters.