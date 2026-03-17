---
type: solution
id: SOL-15
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-15: Feedback Loop After Match Rejection

| Metric | Value |
|---|---|
| User Stories | 1 |
| Components | 1 |
| Functions | 4 |

Without feedback the matching algorithm remains blind. This module collects optional, anonymous rejection reasons and uses them to refine the proposal logic per user and globally. The rejected person never learns the reason.

---

## User Stories

- US-15.1: Optional Rejection Reasoning for Algorithm Improvement


## Edge Cases (SOL-15)

| # | Scenario | Rule |
|---|---|---|
| EC-15.1 | **Feedback timing in flow** | The optional rejection reasoning appears directly after clicking "Decline" in the SOL-5 consent flow (FN-5.1.1.2). Brief overlay with max 2 clicks — no modal, no compulsion. |
| EC-15.2 | **User rejects ALL proposals** | If a user rejects every proposal over a period (e.g. 2 weeks): the system detects the pattern and proactively offers to revise the target person description (SOL-2) or review deal-breakers. No automatic changes. |
| EC-15.3 | **Free-text feedback contains personal data** | Rejection free texts are checked for PII (personally identifiable information) before storage. Found PII is automatically removed/masked before the data is used for algorithm refinement. |