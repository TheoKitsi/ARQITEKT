---
type: Function
id: FN-1.9.1.2
title: "Create Re-Check Order"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.9.1
---

# FN-1.9.1.2: Create Re-Check Order

## Functional Description

- The system shall create a new verification order for the expired or expiring check module when the user confirms re-verification.
- The system shall pre-populate the order with the same check modules as the original order.
- The system shall link the re-check order to the original order for traceability.
- The system shall maintain the historical badge alongside the new badge after re-check completion.
- The system shall update the composite score with the renewed badge.

## Preconditions

- User has confirmed re-verification intent.
- Valid consent still exists for the check modules.

## Behavior

1. User confirms re-verification.
2. System creates re-check order linked to original.
3. Verification proceeds through normal pipeline.
4. On completion: new badge generated, old badge archived.
5. Composite score recalculated.

## Postconditions

- Re-check order created and linked.
- New badge replaces expired badge (historical preserved).
- Score updated.

## Error Handling

- The system shall return HTTP 422 if consent has been revoked since the original order.
- The system shall handle concurrent re-check requests idempotently (one re-check per module per period).