---
type: Component
id: CMP-4.2
title: Wish List Panel
status: draft
parent: US-4.2
---

# CMP-4.2 — Wish List Panel

## Responsibility
Displays saved products with price change indicators and move-to-cart buttons.

## Technology
React component with product card variant for wish list items.

## Interfaces
- Props: `items: WishListItem[]`
- Actions: remove, move to cart
- Indicators: price changed badge when current != saved price
