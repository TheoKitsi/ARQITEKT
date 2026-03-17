---
type: Function
id: FN-1.7.1.1
title: "Render Candidate Badge Card"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.7.1
---

# FN-1.7.1.1: Render Candidate Badge Card

## Functional Description

- The system shall construct a candidate card containing: identity badge, income badge, credit badge (each with green/amber/red/grey indicator), composite score percentile, per-criterion score breakdown, personal statement, and preferred move-in date.
- The system shall map verification snapshot statuses to badge colors: "verified" = green, "partially verified" / "expiring soon" = amber, "failed" / "rejected" = red, "not available" / "not checked" = grey.
- The system shall include a text label alongside each color indicator for WCAG 2.1 AA compliance.
- The system shall never include raw income amounts, credit score numbers, or identity document details.
- The system shall return the card as a structured data object (JSON) for frontend rendering.

## Preconditions

- The candidate's verification snapshot and score breakdown are available.

## Behavior

1. System retrieves verification snapshot from candidacy record.
2. System retrieves score breakdown from Ranking Engine.
3. System maps statuses to badge colors and labels.
4. System assembles card object.
5. System returns card JSON.

## Postconditions

- A complete badge card data object is available for rendering.
- No raw personal data is included.

## Error Handling

- The system shall render a "data unavailable" badge (grey) for any verification type missing from the snapshot.
- The system shall return HTTP 500 if the score breakdown cannot be retrieved, with a fallback message suggesting retry.