---
type: Component
id: CMP-1.2
title: Tenant Middleware
status: draft
parent: US-1.2
---

# CMP-1.2 — Tenant Middleware

## Responsibility
Extracts tenant ID from JWT claims, sets tenant context for request scope, applies row-level filtering.

## Technology
Express/Fastify middleware with async local storage for tenant context.

## Interfaces
- Input: JWT with `tenantId` claim
- Output: `req.tenant` set for downstream handlers
- Rejects: requests with missing or invalid tenant context
