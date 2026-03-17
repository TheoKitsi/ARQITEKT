---
type: Function
id: FN-1.1.1.1
title: "Create Verification Order"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.1.1
---

# FN-1.1.1.1: Create Verification Order

## Functional Description

- The system shall accept a POST request from an authenticated B2B client with: subject reference, selected check modules (or package name), and mandatory/optional flags per module.
- The system shall validate the client's API credentials and rate limit status.
- The system shall resolve package names to individual check modules.
- The system shall verify that valid consent exists for each mandatory check module via the Consent Service.
- The system shall generate a UUID order reference and create the order record with "created" status.
- The system shall dispatch check module execution requests to the respective engines (Identity, Income, Credit).
- The system shall return the order reference ID and initial status.

## Preconditions

- B2B client is authenticated via OAuth 2.0 client credentials.
- Rate limit not exceeded.

## Behavior

1. Client sends order creation request.
2. System validates credentials, rate limit, and consent.
3. System creates order record.
4. System dispatches module execution requests.
5. System returns order ID and status.

## Postconditions

- Order record exists with "created" status.
- Module execution requests are dispatched.
- Audit event emitted.

## Error Handling

- The system shall return HTTP 429 (Too Many Requests) if rate limit exceeded, with Retry-After header.
- The system shall return HTTP 422 if consent is missing for mandatory check modules, listing which modules lack consent.
- The system shall return HTTP 400 if no check modules are specified.
- The system shall return HTTP 401 if client credentials are invalid.