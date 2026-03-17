---
type: Function
id: FN-1.5.1.3
title: "Promote Runner-Up"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.5.1
---

# FN-1.5.1.3: Promote Runner-Up

## Functional Description

- The system shall automatically promote the next highest-ranked candidate when the currently accepted candidate is rejected or withdraws.
- The system shall check the promoted candidate's verification freshness via TrustGate before confirming promotion.
- The system shall notify the promoted candidate that they have been elevated to the accepted position.
- The system shall notify the listing tenant and landlord of the runner-up promotion.
- The system shall update the shortlist view to reflect the new state.
- The system shall restart the decision deadline for the landlord.

## Preconditions

- The accepted candidate has been rejected or has withdrawn.
- Additional candidates exist in the ranking.

## Behavior

1. System detects accepted candidate rejection/withdrawal.
2. System retrieves next candidate from ranking.
3. System checks verification freshness for promoted candidate.
4. If verification valid: system promotes candidate and notifies all parties.
5. If verification expired: system skips to next candidate and repeats.
6. System updates shortlist and restarts decision deadline.
7. System emits audit events for each step.

## Postconditions

- A new candidate is in the accepted position (or shortlist is exhausted).
- All parties are notified.
- The decision deadline is reset.

## Error Handling

- The system shall notify the listing tenant if all candidates in the ranking have been exhausted, offering options to extend the candidacy period or cancel.
- The system shall skip candidates with expired verification and continue to the next one.
- The system shall log each skip with the reason for audit.