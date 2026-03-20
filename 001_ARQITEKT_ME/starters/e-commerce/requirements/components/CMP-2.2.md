---
type: Component
id: CMP-2.2
title: Checkout Stepper
status: draft
parent: US-2.2
---

# CMP-2.2 — Checkout Stepper

## Responsibility
Multi-step checkout form with progress indicator, validation per step, and order summary sidebar.

## Technology
React component with step state machine and form validation.

## Interfaces
- Steps: Shipping, Payment, Review
- Validates: address fields, payment method selection
- Emits: `onOrderPlace(orderData)`
