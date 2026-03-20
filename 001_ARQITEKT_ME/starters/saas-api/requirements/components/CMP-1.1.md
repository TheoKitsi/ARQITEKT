---
type: Component
id: CMP-1.1
title: Auth Service
status: draft
parent: US-1.1
---

# CMP-1.1 — Auth Service

## Responsibility
Handles JWT creation, validation, refresh rotation, and password hashing.

## Technology
Node.js service with jsonwebtoken and bcrypt libraries.

## Interfaces
- Methods: `login(email, password)`, `refresh(token)`, `validate(token)`
- Returns: `{ accessToken, refreshToken, expiresIn }`
