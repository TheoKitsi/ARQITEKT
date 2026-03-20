---
type: Component
id: CMP-1.1
title: Login Form
status: draft
parent: US-1.1
---

# CMP-1.1 — Login Form

## Responsibility
Renders email/password form, handles validation, submits credentials to auth API.

## Technology
React component with form state management.

## Interfaces
- Props: `onSuccess: () => void`
- Emits: auth token stored in session
- API: `POST /api/auth/login`
