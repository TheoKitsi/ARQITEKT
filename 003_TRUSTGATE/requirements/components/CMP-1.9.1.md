---
type: Component
id: CMP-1.9.1
title: "Expiration Manager"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.9
functions:
  - FN-1.9.1.1
  - FN-1.9.1.2
---

# CMP-1.9.1: Expiration Manager

## Responsibility

The Expiration Manager is responsible for tracking verification validity periods and orchestrating re-checks. The system shall assign configurable validity periods per check module (identity: 12 months, income: 6 months, credit: 3 months), send notifications 30 days before expiration, transition expired badges to "expired" status, create re-check orders upon user confirmation, maintain historical badge records alongside renewals, and support bulk expiration queries for B2B clients.

## Interfaces

- **Inbound:** Scheduled Jobs (expiration scan), B2B API (bulk expiration query)
- **Outbound:** Notification Service (expiration warnings), Order Service (re-check order creation), Badge Service (status transition), Audit Service

## Functions

| ID | Title |
|---|---|
| FN-1.9.1.1 | Scan and Notify Expirations |
| FN-1.9.1.2 | Create Re-Check Order |

## Constraints

- Expiration scan runs daily.
- Notification sent 30 days before expiration, once only (no spam).
- Expired badges excluded from valid composite scores.
- Historical badges preserved alongside renewals.

## Infrastructure References

- INF-1 (PostgreSQL — badge validity records)
- INF-7 (Scheduled jobs)