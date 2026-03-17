---
type: Conversation
id: CONV-3
title: "Landlord Decision Flow"
status: draft
version: "1.0"
date: "2025-07-14"
---

# CONV-3: Landlord Decision Flow

## Context

Describes the interaction when the landlord reviews the shortlist and makes accept/reject decisions.

## Actors

- **Landlord** — Reviews and decides
- **System** — Presents shortlist, processes decisions, manages runner-ups
- **Listing Tenant** — Notified of decisions

## Flow

1. **System** transitions listing to "decision-pending" (auto or tenant-triggered after candidacy period).
2. **System** prepares shortlist: top N candidates with badge cards.
3. **System** notifies landlord that shortlist is ready and starts decision deadline timer.
4. **Landlord** opens shortlist view, reviews badge cards, score breakdowns, personal statements.
5. **Landlord** selects a candidate and clicks "Accept" or "Reject".
6a. **Accept:** System re-checks verification freshness via TrustGate. If valid: records acceptance, transitions listing to "completed", notifies accepted candidate and listing tenant. Rejected candidates notified within 24h.
6b. **Reject:** Landlord selects reason. System records rejection, promotes runner-up, notifies affected candidate.
7. If runner-up promoted: flow returns to step 4 with updated shortlist.
8. **System** emits audit events for all decisions.

## Exceptions

- **Verification expired at acceptance:** System blocks acceptance, suggests waiting for re-verification.
- **Decision deadline expired:** System notifies listing tenant who can extend or escalate.
- **All candidates exhausted:** System notifies listing tenant with options to extend candidacy period or cancel.