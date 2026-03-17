---
type: component
id: CMP-12.1.1
status: draft
parent: US-12.1
version: "1.0"
---

# CMP-12.1.1: Intention Module

## Functions

| FN-ID | Function |
|---|---|
| **FN-12.1.1.1** | The system shall provide a mandatory field "Relationship intention" in funnel level 1 with detailed options (Long-term partnership / Marriage / Living together / Getting to know slowly). -> Field defined in SOL-2, Level 1. |
| **FN-12.1.1.2** | The system shall capture the time horizon for partnership readiness as a mandatory field in funnel level 1 (Immediately ready / 1-6 months / 6-12 months / Open). -> Field defined in SOL-2, Level 1. |
| **FN-12.1.1.3** | The system shall capture willingness to relocate (Yes / Only within X km / No) and maximum distance as mandatory fields in funnel level 3 and use them as matching criteria. -> Fields defined in SOL-2, Level 3. |
| **FN-12.1.1.4** | The system shall capture long-distance relationship readiness as a mandatory field in funnel level 3 (Yes / Temporarily / No). -> Field defined in SOL-2, Level 3. |
| **FN-12.1.1.5** | The system shall feed all intention fields (level 1 + level 3) with high weighting into the matching algorithm — incompatible intentions lead to significant score reduction or exclusion. |

## Function Files

- FN-12.1.1.1: Relationship Intention Field
- FN-12.1.1.2: Partnership Time Horizon
- FN-12.1.1.3: Relocation Willingness and Distance
- FN-12.1.1.4: Long-Distance Readiness
- FN-12.1.1.5: Intention Weighting in Matching