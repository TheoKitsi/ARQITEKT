---
type: Conversation
id: CONV-2
title: "Candidate Matching Flow"
status: draft
version: "1.0"
date: "2025-07-14"
---

# CONV-2: Candidate Matching Flow

## Overview

Conversation from the candidate's perspective: joining the pool, receiving match inquiries, and completing viewings.

## Actors

- **Candidate:** TrustGate-verified user seeking rental housing
- **System:** Prospect platform (Pool Service, Shortlist Service, Viewing Scheduler)
- **Owner:** Property owner (indirect interaction through system)

## Flow

1. **Candidate** completes TrustGate verification and receives active badges.
2. **Candidate** opts in to Prospect pool, creating a matching profile (FN-1.2.1.1).
3. **Candidate** grants Prospect-specific consent.
4. **System** indexes profile in matching pool.
5. *(Time passes — candidate is passively matched against owner searches)*
6. **System** sends match inquiry: "An owner is interested — review property details."
7. **Candidate** reviews privacy-preserving property summary.
8. **Candidate** confirms or declines match (FN-1.4.1.2).
9. If confirmed: **System** reveals owner contact details.
10. **Owner** proposes viewing slots; **Candidate** selects a time (FN-1.5.1.1).
11. **System** sends booking confirmation and 24-hour reminder.
12. **Candidate** attends viewing.
13. **System** notifies candidate of owner's decision (selected or not selected).
14. If not selected: **Candidate** remains in active pool for future matches.

## Error Paths

- Badge expires while in pool: System suspends profile, notifies candidate to re-verify.
- Candidate pauses profile: Excluded from matching until reactivated.
- Match inquiry timeout (72h): Auto-declined, owner offered next candidate.