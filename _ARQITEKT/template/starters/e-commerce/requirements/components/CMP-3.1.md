---
type: Component
id: CMP-3.1
title: Order Timeline
status: draft
parent: US-3.1
---

# CMP-3.1 — Order Timeline

## Responsibility
Visual timeline showing order status progression with timestamps and tracking link.

## Technology
React component with step indicators and carrier link integration.

## Interfaces
- Props: `order: Order`, `trackingUrl?: string`
- Renders: status steps (confirmed → processing → shipped → delivered)
