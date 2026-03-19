---
type: UserStory
id: US-2.1
title: Resource CRUD Endpoints
status: draft
parent: SOL-2
---

# US-2.1 — Resource CRUD Endpoints

As an API consumer, I want standard CRUD endpoints for resources so that I can create, read, update, and delete data.

## Acceptance Criteria
1. GET /resources returns paginated list with total count
2. POST /resources creates and returns the new resource
3. PUT /resources/:id updates and returns the resource
4. DELETE /resources/:id returns 204 on success
