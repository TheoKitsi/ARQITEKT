---
type: Component
id: CMP-1.2
title: Auth Provider
status: draft
parent: US-1.1
---

# CMP-1.2 — Auth Provider

## Responsibility
Manages authentication state, token refresh, route guards for protected pages.

## Technology
React Context provider wrapping the application root.

## Interfaces
- Provides: `user`, `isAuthenticated`, `login()`, `logout()`
- Stores: JWT token in httpOnly cookie or secure storage
