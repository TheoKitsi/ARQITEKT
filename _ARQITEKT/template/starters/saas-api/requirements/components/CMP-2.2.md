---
type: Component
id: CMP-2.2
title: Query Builder
status: draft
parent: US-2.2
---

# CMP-2.2 — Query Builder

## Responsibility
Parses query parameters into database-safe filter, sort, and pagination objects.

## Technology
Utility module with parameterized query construction (SQL injection safe).

## Interfaces
- Input: `req.query` object
- Output: `{ where, orderBy, limit, offset, cursor }`
- Validates: field names against allowed list, prevents injection
