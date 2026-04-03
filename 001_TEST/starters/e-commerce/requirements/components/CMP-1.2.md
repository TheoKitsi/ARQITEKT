---
type: Component
id: CMP-1.2
title: Search & Filter Bar
status: draft
parent: US-1.1
---

# CMP-1.2 — Search & Filter Bar

## Responsibility
Combined search input with faceted filter controls (category, price, rating).

## Technology
React component with debounced input and collapsible filter panel.

## Interfaces
- Props: `categories: Category[]`, `onSearch: (query) => void`, `onFilter: (filters) => void`
- State: active filters, search query
