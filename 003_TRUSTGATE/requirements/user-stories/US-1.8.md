---
type: UserStory
id: US-1.8
title: "API Result Retrieval"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.8.1
---

# US-1.8: API Result Retrieval

**As a** B2B integration partner
**I want to** retrieve verification results through a secured, versioned API
**So that** I can integrate trust decisions into my own system

## Acceptance Criteria

- **AC-1.8.1:** The system shall provide a REST API that returns badge statuses, composite score, validity periods, and order reference IDs for a given subject.
- **AC-1.8.2:** The system shall enforce multi-tenant isolation: clients can only access results for their own orders or subjects who have granted them consent.
- **AC-1.8.3:** The system shall return API responses with versioned schema fields (e.g., `"schema_version": "1.0"`) for backward compatibility.
- **AC-1.8.4:** The system shall require OAuth 2.0 client credentials for B2B authentication.
- **AC-1.8.5:** The system shall enforce per-client rate limits (configurable, default 100 requests/minute) and return HTTP 429 when exceeded.
- **AC-1.8.6:** The system shall return HTTP 403 if the requesting client does not have consent for the requested data types.
- **AC-1.8.7:** The system shall support webhook callbacks for asynchronous result delivery when a verification order completes.