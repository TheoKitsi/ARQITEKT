---
type: component
id: CMP-3.1.1
status: draft
parent: US-3.1
version: "1.0"
---

# CMP-3.1.1: Matching Engine

## Functions

| FN-ID | Function |
|---|---|
| **FN-3.1.1.1** | The system shall compute matching bidirectionally — profile A is checked against the target person of B AND profile B against the target person of A; both directions must reach the minimum score. |
| **FN-3.1.1.2** | The system shall weight funnel levels 1-3 more heavily than levels 4-5 in the matching algorithm (configurable weighting factors). |
| **FN-3.1.1.3** | The system shall respect user prioritizations: Must-Have fields are weighted higher than Nice-to-Have fields; Indifferent fields are excluded from matching. |
| **FN-3.1.1.4** | The system shall implement deal-breakers as knockout filters — if a deal-breaker is not met, the profile is immediately excluded from matching regardless of the remaining score. |
| **FN-3.1.1.5** | The system shall semantically analyze free-text fields via NLP (Natural Language Processing) and incorporate the results into the score calculation. |
| **FN-3.1.1.6** | The system shall compute and display an overall score in percent (0-100%) per match. |
| **FN-3.1.1.7** | The system shall support a configurable minimum score for proposals (system default + optional user adjustment). |

## Function Files

- FN-3.1.1.1: Bidirectional Matching Calculation
- FN-3.1.1.2: Funnel Level Weighting
- FN-3.1.1.3: User Prioritization Weighting
- FN-3.1.1.4: Deal-Breaker Knockout Filter
- FN-3.1.1.5: NLP Free-Text Analysis
- FN-3.1.1.6: Overall Match Score
- FN-3.1.1.7: Configurable Minimum Score