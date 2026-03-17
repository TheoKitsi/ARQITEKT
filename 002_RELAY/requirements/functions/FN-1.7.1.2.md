---
type: Function
id: FN-1.7.1.2
title: "Generate Listing Summary Statistics"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.7.1
---

# FN-1.7.1.2: Generate Listing Summary Statistics

## Functional Description

- The system shall compute aggregate statistics for a listing: total candidate count, average score, score distribution (quartiles), and count per badge color for each verification type.
- The system shall update statistics in real time as candidacies are submitted or withdrawn.
- The system shall display the summary on the listing overview page.

## Preconditions

- At least one candidacy exists for the listing.

## Behavior

1. System queries all active candidacies for the listing.
2. System computes count, average, quartiles, and badge color counts.
3. System returns summary object.

## Postconditions

- Up-to-date listing summary statistics are available.

## Error Handling

- The system shall return zeroed statistics if no candidacies exist rather than an error.
- The system shall handle division-by-zero for average calculation when count is zero.