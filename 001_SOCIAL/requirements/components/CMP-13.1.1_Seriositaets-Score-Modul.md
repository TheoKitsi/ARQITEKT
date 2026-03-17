---
type: component
id: CMP-13.1.1
status: draft
parent: US-13.1
version: "1.0"
---

# CMP-13.1.1: Seriousness Score Module

## Functions

| FN-ID | Function |
|---|---|
| **FN-13.1.1.1** | The system shall calculate a seriousness score from the following factors: verification level (completed/pending), profile completeness (funnel depth), response behavior (response rate and time to matches), activity patterns (regularity of usage), report/block history (number of incoming reports). |
| **FN-13.1.1.2** | The system shall display the seriousness score as a visual, qualitative indicator on match proposals (e.g. color scale: Green/Yellow/Orange — no exact number, no manipulable representation). |
| **FN-13.1.1.3** | The system shall deprioritize profiles with a low seriousness score in the matching algorithm (less visibility for other users). |
| **FN-13.1.1.4** | The system shall notify users when their seriousness score is declining and provide specific improvement suggestions (e.g. "Respond to your matches to improve your seriousness status"). |
| **FN-13.1.1.5** | The system shall transparently document the score calculation (help page) but ensure that the score cannot be manipulated through artificial behavior. |

## Function Files

- FN-13.1.1.1: Seriousness Score Calculation
- FN-13.1.1.2: Visual Score Indicator
- FN-13.1.1.3: Low Score Deprioritization
- FN-13.1.1.4: Score Decline Notification
- FN-13.1.1.5: Score Transparent Documentation