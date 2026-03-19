---
type: Component
id: CMP-3.2
title: Notification Handler
status: draft
parent: US-3.2
---

# CMP-3.2 — Notification Handler

## Responsibility
Handles push token registration, foreground/background notification display, and deep link extraction.

## Technology
Firebase Cloud Messaging (FCM) or APNs with platform-specific handlers.

## Interfaces
- Methods: `registerToken()`, `handleForeground(msg)`, `handleBackground(msg)`
- Routes: deep link payload to appropriate screen
