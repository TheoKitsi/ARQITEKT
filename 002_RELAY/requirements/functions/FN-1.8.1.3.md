---
type: Function
id: FN-1.8.1.3
title: "Export Audit Data"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.8.1
---

# FN-1.8.1.3: Export Audit Data

## Functional Description

- The system shall allow platform operators to export audit records matching a search query in JSON or CSV format.
- The system shall generate the export asynchronously for large result sets (> 1000 records) and notify the operator when the file is ready for download.
- The system shall include a hash chain verification summary in the export metadata.
- The system shall retain export files for 7 days before automatic deletion.

## Preconditions

- The caller is authenticated and has the "audit-viewer" role.
- A valid search query is provided.

## Behavior

1. Operator requests export with format (JSON/CSV) and search filters.
2. For small sets (<=1000): system generates file synchronously and returns download URL.
3. For large sets (>1000): system queues export job and returns job ID.
4. System generates file with records and hash chain summary.
5. System notifies operator when ready (for async exports).
6. System schedules file cleanup after 7 days.

## Postconditions

- An export file is available for download.
- The file includes hash chain verification metadata.

## Error Handling

- The system shall return HTTP 403 if the caller lacks the "audit-viewer" role.
- The system shall return HTTP 400 if the requested format is not JSON or CSV.
- The system shall notify the operator if an async export job fails, with the error reason.