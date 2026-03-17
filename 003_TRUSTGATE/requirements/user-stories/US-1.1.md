---
type: UserStory
id: US-1.1
title: "Verification Order Management"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.1.1
---

# US-1.1: Verification Order Management

**As a** B2B client
**I want to** create a verification order with configurable check modules
**So that** I can request only the verifications needed for my specific process

## Acceptance Criteria

- **AC-1.1.1:** The system shall allow B2B clients to create verification orders via API by specifying a subject (user reference) and selecting from available check modules (identity, income, credit).
- **AC-1.1.2:** The system shall support pre-configured packages (e.g., "full check", "identity only", "financial check") that bundle common module combinations.
- **AC-1.1.3:** The system shall allow marking check modules as mandatory or optional within an order.
- **AC-1.1.4:** The system shall generate a unique order reference ID (UUID) for each order.
- **AC-1.1.5:** The system shall track order status through its lifecycle: created, in-progress, partially-complete, complete, expired, cancelled.
- **AC-1.1.6:** The system shall reject orders for subjects who have not provided consent for the requested check modules.
- **AC-1.1.7:** The system shall enforce B2B client rate limits and return HTTP 429 when exceeded.