---
type: Component
id: CMP-3.1
title: Data Table
status: draft
parent: US-3.1
---

# CMP-3.1 — Data Table

## Responsibility
Displays tabular data with sorting, search, pagination, and column visibility controls.

## Technology
React table component with virtualized rows for large datasets.

## Interfaces
- Props: `columns: Column[]`, `data: Row[]`, `pageSize: number`
- Events: `onSort`, `onSearch`, `onPageChange`, `onRowClick`
