---
type: Component
id: CMP-2.2
title: Content Card
status: draft
parent: US-2.1
---

# CMP-2.2 — Content Card

## Responsibility
Reusable card widget for feed items showing thumbnail, title, subtitle, and action buttons.

## Technology
Custom widget with cached network image and tap handler.

## Interfaces
- Props: `item: ContentItem`, `onTap: () => void`
- Layout: image + text stack with fixed aspect ratio
