---
type: component
id: CMP-15.1.1
status: draft
parent: US-15.1
version: "1.0"
---

# CMP-15.1.1: Rejection Feedback Module

## Functions

| FN-ID | Function |
|---|---|
| **FN-15.1.1.1** | The system shall offer an optional, anonymous brief reasoning on match rejection — with predefined categories (Values, Lifestyle, Distance, Intention, No feeling, Other) and an optional free-text field. |
| **FN-15.1.1.2** | The system shall never display rejection reasons to the rejected person — neither directly, nor indirectly, nor in aggregate. |
| **FN-15.1.1.3** | The system shall use aggregated rejection data (anonymized) for continuous refinement of the matching algorithm — both globally (model improvement) and individually (per user). |
| **FN-15.1.1.4** | The system shall detect recurring rejection patterns per user (e.g. "regularly rejects due to distance") and adjust individual proposal logic accordingly (e.g. prioritize closer radius). |

## Function Files

- FN-15.1.1.1: Optional Rejection Reasoning
- FN-15.1.1.2: Rejection Privacy Protection
- FN-15.1.1.3: Algorithm Refinement from Rejections
- FN-15.1.1.4: Pattern Detection and Adjustment