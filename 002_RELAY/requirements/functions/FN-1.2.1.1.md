---
type: Function
id: FN-1.2.1.1
title: "Configure Criteria Catalog"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.2.1
---

# FN-1.2.1.1: Configure Criteria Catalog

## Functional Description

- The system shall present the listing tenant with a default set of system criteria (minimum income ratio, no negative credit record, verified identity, employment status) that can be activated or deactivated.
- The system shall allow the tenant to add up to 5 custom criteria, each with a label (max 100 characters), description (max 500 characters), data type (boolean, number, text), and optional weight override.
- The system shall allow the tenant to adjust the weight of each active criterion within a permitted range of 0.5x to 2.0x of the default weight.
- The system shall validate that at least one criterion is active when the tenant attempts to finalize the catalog.
- The system shall persist the catalog configuration and emit an audit event for each modification.

## Preconditions

- The listing exists in "draft" state.
- The tenant is authenticated and is the listing owner.
- The catalog has not yet been locked (no candidacies received).

## Behavior

1. Tenant opens the criteria configuration panel for the listing.
2. System displays system criteria with default states and weights.
3. Tenant toggles criteria, adjusts weights, and optionally adds custom criteria.
4. System validates constraints on each save.
5. System persists changes and emits audit events.

## Postconditions

- The criteria catalog is saved with all active criteria, custom criteria, and weights.
- At least one criterion is active.
- Audit entries exist for catalog modifications.

## Error Handling

- The system shall return HTTP 400 (Bad Request) if no criteria are active at finalization.
- The system shall return HTTP 400 if a custom criterion exceeds field length limits.
- The system shall return HTTP 400 if weight is outside the 0.5x to 2.0x range.
- The system shall return HTTP 409 (Conflict) if the catalog has been locked.
- The system shall return HTTP 422 if the number of custom criteria exceeds 5.