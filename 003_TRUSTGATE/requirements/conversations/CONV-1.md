---
type: Conversation
id: CONV-1
title: "End-to-End Verification Flow"
status: draft
version: "1.0"
date: "2025-07-14"
---

# CONV-1: End-to-End Verification Flow

## Context

Describes the complete interaction from B2B order creation through identity/income/credit verification to result retrieval.

## Actors

- **B2B Client** — Orders verification
- **End User** — Undergoes verification
- **System** — Orchestrates pipeline
- **External Providers** — eID, SCHUFA

## Flow

1. **B2B Client** creates verification order via API with selected check modules.
2. **System** validates consent, creates order, dispatches module requests.
3. **System** sends notification to end user with verification link.
4. **End User** opens link, starts identity verification (eID/NFC or alternative).
5. **System** completes identity check, generates identity badge.
6. **End User** uploads income documents.
7. **System** processes documents via OCR, runs plausibility checks, generates income badge.
8. **System** executes credit check via SCHUFA (with consent), generates credit badge.
9. **System** calculates composite score from all badges.
10. **System** updates order status to "complete", sends notifications.
11. **B2B Client** retrieves results via API or receives webhook callback.

## Exceptions

- **NFC not available:** redirected to video-ident.
- **Income doc unreadable:** routed to manual review, user notified.
- **Credit provider timeout:** badge set to "pending", retried.
- **Consent revoked mid-flow:** affected modules cancelled.