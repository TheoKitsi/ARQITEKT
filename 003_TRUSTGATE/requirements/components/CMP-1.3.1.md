---
type: Component
id: CMP-1.3.1
title: "Alternative Identity Provider"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.3
functions:
  - FN-1.3.1.1
---

# CMP-1.3.1: Alternative Identity Provider

## Responsibility

The Alternative Identity Provider is responsible for managing non-eID identification methods. The system shall integrate with at least one certified video-ident provider, produce badges equivalent to the eID flow (same model, same expiration), record the method used in badge metadata, enforce the same data minimization rules, and support plugin-based addition of future methods without core changes.

## Interfaces

- **Inbound:** End User (alternative ident flow trigger), eID Engine (redirect on NFC absence)
- **Outbound:** Video-Ident Provider API, Badge Service, Audit Service

## Functions

| ID | Title |
|---|---|
| FN-1.3.1.1 | Execute Alternative Identification |

## Constraints

- Security level must be equivalent to eID (provider must be eIDAS-certified or equivalent).
- Same data minimization rules as eID (only name, DOB, nationality).
- Badge produced must be indistinguishable in structure from eID badges (method noted only in metadata).

## Infrastructure References

- INF-1 (PostgreSQL — verification records)
- INF-3 (Encrypted storage)