---
type: Component
id: CMP-4.1
title: Auth Modal
status: draft
parent: US-4.1
---

# CMP-4.1 — Auth Modal

## Responsibility
Login/register modal with tab toggle, social auth buttons, and email verification prompt.

## Technology
React modal with form toggle and OAuth redirect handling.

## Interfaces
- Modes: login, register
- Social: Google, Apple sign-in buttons
- Events: `onAuthSuccess(user)`, `onClose()`
