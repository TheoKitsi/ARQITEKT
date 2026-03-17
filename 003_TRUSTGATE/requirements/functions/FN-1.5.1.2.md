---
type: Function
id: FN-1.5.1.2
title: "Handle Provider Failover"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.5.1
---

# FN-1.5.1.2: Handle Provider Failover

## Functional Description

- The system shall detect provider unavailability through timeout or error responses.
- The system shall retry the current provider with exponential backoff (5s, 20s, 60s) for up to 3 attempts.
- The system shall switch to an alternative provider (if configured) after primary provider exhaustion.
- The system shall set the badge to "unavailable" and notify the ordering client if all providers fail.
- The system shall record all failover events in the audit trail.

## Preconditions

- A credit check request has been initiated.
- The primary provider has returned an error or timed out.

## Behavior

1. Primary provider fails.
2. System retries with backoff.
3. If retries exhausted and alternative provider configured: switch to alternative.
4. If all providers fail: set badge "unavailable", notify client.

## Postconditions

- Credit check completed via alternative provider, or badge set to "unavailable".
- All failover steps logged in audit.

## Error Handling

- The system shall not charge the B2B client for failed credit checks.
- The system shall alert ops when a provider's failure rate exceeds 10% in a 1-hour window.