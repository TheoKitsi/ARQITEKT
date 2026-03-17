---
type: UserStory
id: US-1.2
title: "Criteria Catalog"
status: draft
version: "1.0"
date: "2025-07-14"
parent: SOL-1
components:
  - CMP-1.2.1
---

# US-1.2: Criteria Catalog

**As a** listing tenant
**I want to** define a criteria catalog for my listing from system-provided and custom criteria
**So that** candidates know the requirements upfront and the ranking engine can score them fairly

## Acceptance Criteria

- **AC-1.2.1:** The system shall provide a default set of system criteria (minimum income ratio, no negative credit record, verified identity, employment status) that the tenant can activate or deactivate per listing.
- **AC-1.2.2:** The system shall allow the tenant to add up to 5 custom criteria with a label, description, data type (boolean, number, text), and an optional weight override.
- **AC-1.2.3:** The system shall assign a default weight to each system criterion and allow the tenant to adjust weights within a permitted range (0.5x to 2.0x).
- **AC-1.2.4:** The system shall display the complete criteria catalog (names, descriptions, weights) on the public listing page so candidates can self-assess before applying.
- **AC-1.2.5:** The system shall lock the criteria catalog once the first candidacy is received to prevent mid-process rule changes.
- **AC-1.2.6:** The system shall validate that at least one criterion is active before allowing listing publication.
- **AC-1.2.7:** The system shall normalize all weights to sum to 1.0 for ranking calculation.