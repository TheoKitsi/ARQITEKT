---
type: Conversation
id: CONV-2
title: "Data Subject Rights Request Flow"
status: draft
version: "1.0"
date: "2025-07-14"
---

# CONV-2: Data Subject Rights Request Flow

## Context

Describes the interaction when a data subject exercises their GDPR rights (access, deletion, correction).

## Actors

- **Data Subject** — Exercises rights
- **System** — Processes request
- **Platform Operator** — Reviews corrections

## Flow

1. **Data Subject** opens self-service portal and selects request type (access, deletion, correction).
2. For **access:** System compiles all personal data, generates JSON export, notifies subject within 72h.
3. For **deletion:** System cancels active orders, revokes consents, applies retention rules, deletes/anonymizes data, notifies subject and affected B2B clients.
4. For **correction:** System classifies as auto-correctable or manual. Auto: applies immediately. Manual: routes to operator for review.
5. **System** logs all actions in audit trail.
6. **System** notifies subject of completion.

## Exceptions

- **Legal hold on data:** deletion blocked for held categories, subject informed.
- **Correction affects verification result:** re-verification triggered after operator approval.
- **Operator rejects correction:** subject notified with explanation and appeal guidance.