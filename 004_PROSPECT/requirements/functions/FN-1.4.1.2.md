---
type: Function
id: FN-1.4.1.2
title: "Process Mutual Match"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.4.1
---

# FN-1.4.1.2: Process Mutual Match

## Functional Description

- The system shall notify approved candidates that an owner has expressed interest.
- The system shall present candidates with the property description (without owner identity) and request match confirmation.
- The system shall reveal contact details to both parties only after mutual confirmation.
- The system shall forward confirmed matches to the Viewing Scheduler.

## Preconditions

- Owner has approved at least one candidate on the shortlist.
- Candidate has an active pool profile.

## Behavior

1. Send match inquiry notification to approved candidate.
2. Candidate reviews property details and confirms or declines.
3. If confirmed: reveal owner and candidate contact details to both parties.
4. Create viewing invitation record in Viewing Scheduler.
5. If declined: notify owner and suggest next ranked candidate.

## Postconditions

- Mutual match recorded and contact details exchanged.
- Viewing invitation created for confirmed matches.
- Declined matches logged for analytics.

## Error Handling

- The system shall time out match inquiries after 72 hours and auto-decline.
- The system shall return `410 Gone` when the candidate profile has been deactivated since shortlisting.
- The system shall notify the owner when all approved candidates decline.