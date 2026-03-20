---
type: Component
id: CMP-3.2
title: Record Form
status: draft
parent: US-3.2
---

# CMP-3.2 — Record Form

## Responsibility
Dynamic form for creating and editing records with field validation and submit handling.

## Technology
React form with schema-driven field rendering and validation.

## Interfaces
- Props: `schema: FormSchema`, `initialValues?: Record`, `onSubmit: (data) => void`
- Validation: field-level and form-level with error display
