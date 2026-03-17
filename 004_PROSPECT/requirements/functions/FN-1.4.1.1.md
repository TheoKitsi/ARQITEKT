---
type: Function
id: FN-1.4.1.1
title: "Assemble and Deliver Shortlist"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.4.1
---

# FN-1.4.1.1: Assemble and Deliver Shortlist

## Functional Description

- The system shall assemble the top N ranked candidates into a shortlist with privacy-preserving profiles (badges, score, preferences — no name, no contact).
- The system shall publish the shortlist to the owner dashboard and send an email notification.
- The system shall allow the owner to approve or dismiss individual candidates.
- The system shall support a single re-matching request if the owner dismisses all candidates.

## Preconditions

- Matching Engine has completed and forwarded a ranked result set.
- Owner has an active search in status `matching-complete`.

## Behavior

1. Retrieve ranked candidate list from Matching Engine.
2. Build privacy-preserving profile summaries (badges, score, preferences, approximate location).
3. Persist shortlist records in PostgreSQL.
4. Push shortlist to owner dashboard (WebSocket update).
5. Send email notification with shortlist summary (no candidate details in email body).
6. Update search status to `shortlist-delivered`.

## Postconditions

- Shortlist visible on owner dashboard.
- Email notification sent.
- Search status updated to `shortlist-delivered`.

## Error Handling

- The system shall return `404 Not Found` when the search ID does not exist.
- The system shall return `409 Conflict` when a shortlist has already been delivered for this search.
- The system shall queue email delivery for retry on SMTP failure.