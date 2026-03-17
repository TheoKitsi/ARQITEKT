---
type: UserStory
id: US-1.1
title: "Search Request Creation"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.1.1
---

# US-1.1: Search Request Creation

**As a** property owner
**I want to** create a tenant search request by specifying my property details and ideal tenant criteria
**So that** the system can find matching, verified candidates for my vacant unit

## Acceptance Criteria

- **AC-1.1.1:** The system shall provide a search creation form with: property address, unit type (apartment, house, room), size (sqm), rent (warm/cold), available-from date, and preferred lease duration.
- **AC-1.1.2:** The system shall allow the owner to define tenant criteria: minimum income ratio (configurable, default 3x rent), required verification badges (identity, income, credit), maximum move-in timeline, and optional preferences (non-smoker, no pets, etc.).
- **AC-1.1.3:** The system shall normalize the property address via geocoding for proximity-based matching.
- **AC-1.1.4:** The system shall validate all required fields before creating the search request.
- **AC-1.1.5:** The system shall generate a unique search reference ID and set initial status to "created".
- **AC-1.1.6:** The system shall support property manager accounts that create searches on behalf of owners with delegated access.
- **AC-1.1.7:** The system shall trigger the matching engine immediately upon search creation.