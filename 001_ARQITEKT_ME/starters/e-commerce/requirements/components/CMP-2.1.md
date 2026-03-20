---
type: Component
id: CMP-2.1
title: Cart Drawer
status: draft
parent: US-2.1
---

# CMP-2.1 — Cart Drawer

## Responsibility
Slide-out drawer showing cart contents, quantity controls, and checkout button.

## Technology
React component with animation, synced to cart state.

## Interfaces
- Props: `isOpen: boolean`, `onClose: () => void`
- Actions: update quantity, remove item, proceed to checkout
