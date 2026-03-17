---
type: Function
id: FN-1.5.1.1
title: "Present Shortlist to Landlord"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.5.1
---

# FN-1.5.1.1: Present Shortlist to Landlord

## Functional Description

- The system shall retrieve the top N candidates from the ranking (configurable shortlist size, default 3).
- The system shall request badge renders for each shortlisted candidate from the Badge Renderer.
- The system shall assemble the shortlist view with badges, score breakdown, personal statement, and move-in date for each candidate.
- The system shall present the shortlist to the landlord via the Landlord UI.
- The system shall start the decision deadline timer (default 7 days).

## Preconditions

- The listing has at least one candidate.
- The listing tenant has triggered the decision phase (or auto-trigger after candidacy period ends).
- The landlord has not yet made a decision.

## Behavior

1. Listing transitions to "decision-pending" state.
2. System retrieves top N candidates from Ranking Engine.
3. System requests badge card renders.
4. System assembles shortlist view.
5. System notifies landlord that shortlist is ready.
6. System starts decision deadline timer.

## Postconditions

- The landlord has access to the shortlist view.
- The decision deadline timer is running.
- The listing is in "decision-pending" state.

## Error Handling

- The system shall display an empty-state message if no candidates meet the minimum threshold.
- The system shall handle Ranking Engine unavailability by retrying up to 3 times before showing an error to the landlord.