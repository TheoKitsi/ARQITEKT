---
type: UserStory
id: US-1.1
title: API Authentication
status: draft
parent: SOL-1
---

# US-1.1 — API Authentication

As an API consumer, I want to authenticate with JWT tokens so that I can securely access tenant-scoped resources.

## Acceptance Criteria
1. POST /auth/login returns access + refresh tokens
2. Access tokens expire after configurable TTL
3. Refresh token rotation prevents replay attacks
4. Invalid tokens return 401 with clear error message
