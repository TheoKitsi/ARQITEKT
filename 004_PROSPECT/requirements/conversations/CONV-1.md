---
type: Conversation
id: CONV-1
title: "Search to Lease Flow"
status: draft
version: "1.0"
date: "2025-07-14"
---

# CONV-1: Search to Lease Flow

## Overview

End-to-end conversation from search request creation through tenant selection.

## Actors

- **Owner:** Property owner initiating the tenant search
- **System:** Prospect platform (Search Service, Matching Engine, Shortlist Service, Viewing Scheduler, Decision Tracker)
- **Candidate:** Verified tenant in the matching pool

## Flow

1. **Owner** creates a search request with property details and criteria.
2. **System** geocodes address, validates fields, confirms creation (FN-1.1.1.1).
3. **System** executes matching run within 30 minutes (FN-1.3.1.1, FN-1.3.1.2).
4. **System** assembles and delivers shortlist to owner dashboard (FN-1.4.1.1).
5. **Owner** reviews shortlist and approves candidates.
6. **System** sends match inquiries to approved candidates (FN-1.4.1.2).
7. **Candidate** reviews property and confirms or declines match.
8. **System** reveals contact details on mutual confirmation.
9. **Owner** proposes viewing time slots (FN-1.5.1.1).
10. **Candidate** selects a slot; system confirms booking.
11. **System** sends 24-hour reminder.
12. **Owner** records attendance and notes (FN-1.5.1.2).
13. **Owner** selects a tenant or closes search (FN-1.6.1.1 / FN-1.6.1.2).
14. **System** notifies all parties and transitions search to terminal state.

## Error Paths

- No candidates pass filters: System sets status `no-candidates`, owner can adjust criteria.
- All candidates decline match: System notifies owner, suggests re-matching or criteria adjustment.
- Viewing no-show: System records and feeds into decision data.
- Search expires (30 days): System auto-closes with notification.