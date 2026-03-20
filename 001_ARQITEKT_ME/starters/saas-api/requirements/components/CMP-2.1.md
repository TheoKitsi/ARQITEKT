---
type: Component
id: CMP-2.1
title: Resource Controller
status: draft
parent: US-2.1
---

# CMP-2.1 — Resource Controller

## Responsibility
Generalized CRUD controller that can be instantiated per resource type with schema validation.

## Technology
Express router factory with zod schema validation.

## Interfaces
- Factory: `createResourceRouter(model, schema)`
- Routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- Middleware: auth, tenant, validation
