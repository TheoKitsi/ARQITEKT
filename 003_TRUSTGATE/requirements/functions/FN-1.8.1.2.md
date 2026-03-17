---
type: Function
id: FN-1.8.1.2
title: "Manage Webhook Subscriptions"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.8.1
---

# FN-1.8.1.2: Manage Webhook Subscriptions

## Functional Description

- The system shall allow B2B clients to register webhook URLs for asynchronous result delivery.
- The system shall validate webhook URLs by sending a verification challenge on registration.
- The system shall deliver a POST request to the registered URL when a verification order completes, containing the same data as the result API.
- The system shall sign webhook payloads with HMAC-SHA256 using a client-specific secret.
- The system shall retry failed webhook deliveries 3 times with exponential backoff.

## Preconditions

- Client is authenticated.
- Webhook URL is reachable and passes verification challenge.

## Behavior

1. Client registers webhook URL.
2. System sends verification challenge.
3. On challenge success: subscription active.
4. On order completion: system sends signed POST to URL.

## Postconditions

- Webhook subscription is active.
- Results delivered asynchronously on order completion.

## Error Handling

- The system shall deactivate webhook subscriptions after 10 consecutive delivery failures and notify the client.
- The system shall return HTTP 400 if the webhook URL fails the verification challenge.
- The system shall log all webhook delivery attempts and outcomes.