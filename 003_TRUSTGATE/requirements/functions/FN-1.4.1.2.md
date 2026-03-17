---
type: Function
id: FN-1.4.1.2
title: "Run Plausibility Checks"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.4.1
---

# FN-1.4.1.2: Run Plausibility Checks

## Functional Description

- The system shall validate OCR-extracted fields against plausibility rules: net income <= gross income, period dates within expected range, currency is EUR, employer name present.
- The system shall cross-validate multiple documents (if provided): amounts should be consistent across periods, employer names should match.
- The system shall assign a plausibility score (0-100) and flag documents below a configurable threshold (default: 60) for manual review.
- The system shall classify the income into a range bracket (e.g., "2000-3000 EUR/month") for badge display.
- The system shall never store or expose exact income amounts beyond the processing pipeline.

## Preconditions

- OCR extraction has completed successfully.
- At least one income document has been processed.

## Behavior

1. System receives OCR-extracted data.
2. System applies validation rules.
3. System cross-validates across multiple documents.
4. System assigns plausibility score.
5. If score >= threshold: generates income badge with range bracket.
6. If score < threshold: flags for manual review.

## Postconditions

- Plausibility results stored (score, flags, range bracket).
- Income badge generated or manual review initiated.

## Error Handling

- The system shall treat missing OCR fields as "unable to verify" rather than "failed", routing to manual review.
- The system shall log all plausibility check inputs and outputs for audit.