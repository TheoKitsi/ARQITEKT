---
type: Function
id: FN-1.8.1.1
title: "Serve Verification Results"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.8.1
---

# FN-1.8.1.1: Serve Verification Results

## Functional Description

- The system shall accept GET requests with a subject reference or order reference from authenticated B2B clients.
- The system shall validate that the requesting client has consent-based access to the subject's data.
- The system shall return: badge statuses (per type), composite score and breakdown, validity periods, order reference IDs, and schema version.
- The system shall enforce multi-tenant isolation: clients see only their own orders or subjects with active consent grants.
- The system shall include `schema_version` in every response for backward compatibility.

## Preconditions

- Client is authenticated via OAuth 2.0.
- Client has consent-based or order-based access to the requested data.

## Behavior

1. Client sends GET request with subject or order reference.
2. System validates credentials and access rights.
3. System retrieves badges, score, and validity data.
4. System returns structured response with schema version.

## Postconditions

- Client receives verification results.
- Access logged in audit.

## Error Handling

- The system shall return HTTP 403 if the client lacks consent or order-based access.
- The system shall return HTTP 404 if the subject or order not found.
- The system shall return HTTP 429 if rate limit exceeded.