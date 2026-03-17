---
type: Function
id: FN-1.1.1.2
title: "Track Order Status"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.1.1
---

# FN-1.1.1.2: Track Order Status

## Functional Description

- The system shall provide a GET endpoint for B2B clients to query the current status of a verification order by reference ID.
- The system shall return the overall order status and per-module status breakdown.
- The system shall update the overall status based on module completion: "in-progress" when any module starts, "partially-complete" when some but not all modules finish, "complete" when all mandatory modules finish.
- The system shall transition to "expired" if any mandatory module times out beyond the configured maximum processing time.

## Preconditions

- The order exists and belongs to the requesting client.

## Behavior

1. Client queries order status by reference ID.
2. System retrieves order and per-module statuses.
3. System computes overall status from module statuses.
4. System returns overall and per-module status.

## Postconditions

- Client receives current order status.

## Error Handling

- The system shall return HTTP 404 if the order does not exist or does not belong to the requesting client.
- The system shall return HTTP 401 if credentials are invalid.