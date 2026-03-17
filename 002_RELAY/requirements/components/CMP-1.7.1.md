---
type: Component
id: CMP-1.7.1
title: "Badge Renderer"
status: draft
version: "1.0"
date: "2025-07-14"
parent: US-1.7
functions:
  - FN-1.7.1.1
  - FN-1.7.1.2
---

# CMP-1.7.1: Badge Renderer

## Responsibility

The Badge Renderer is responsible for generating privacy-preserving visual representations of candidate verification and qualification data. The system shall render identity, income, and credit verification results as badges with green/amber/red/grey status indicators, display the composite score as a percentile, show personal statement and move-in date, and never expose raw income amounts, credit scores, or identity document details. The system shall support sorting and filtering by score, badge status, or submission date, and ensure WCAG 2.1 AA accessibility by including text labels alongside color indicators.

## Interfaces

- **Inbound:** Ranking Engine (scores and badge states), Candidacy Service (personal statement, move-in date)
- **Outbound:** Landlord UI (rendered candidate cards), Listing Summary UI (aggregate statistics)

## Functions

| ID | Title |
|---|---|
| FN-1.7.1.1 | Render Candidate Badge Card |
| FN-1.7.1.2 | Generate Listing Summary Statistics |

## Constraints

- No raw personal data in any rendered output.
- Color indicators must have text label equivalents (WCAG 2.1 AA).
- Badge states: verified (green), partially verified (amber), failed (red), not available (grey).

## Infrastructure References

- INF-4 (Frontend — UI rendering)