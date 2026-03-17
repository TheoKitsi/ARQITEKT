---
type: Function
id: FN-1.5.1.1
title: "Execute Credit Check"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.5.1
---

# FN-1.5.1.1: Execute Credit Check

## Functional Description

- The system shall verify that valid consent for credit checking exists before making any provider request.
- The system shall send a credit inquiry to the configured provider (SCHUFA) via their certified API.
- The system shall include only the minimum required data (name, DOB, address) in the inquiry.
- The system shall receive the credit assessment and map it to a badge status: positive (no negative entries), negative (negative entries found), pending (awaiting response), unavailable (no data on file).
- The system shall store only the derived badge status and provider reference ID — never the full credit report.
- The system shall record provider name, request timestamp, and response timestamp.

## Preconditions

- Valid consent for credit check on file.
- Provider API is reachable.

## Behavior

1. System verifies consent.
2. System sends inquiry to provider.
3. Provider returns assessment.
4. System maps to badge status.
5. System stores badge + reference ID.
6. System updates order module status.

## Postconditions

- Credit badge generated.
- Provider reference and timestamps recorded.
- Full report discarded; only badge persisted.

## Error Handling

- The system shall return HTTP 422 if consent is missing or expired.
- The system shall set badge to "pending" if provider times out, and queue retry (3 attempts, exponential backoff: 5s, 20s, 60s).
- The system shall set badge to "unavailable" if all retries exhausted and notify the ordering client.