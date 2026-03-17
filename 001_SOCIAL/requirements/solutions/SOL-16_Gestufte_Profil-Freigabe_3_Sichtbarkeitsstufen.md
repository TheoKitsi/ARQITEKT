---
type: solution
id: SOL-16
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-16: Staged Profile Release --- 3 Visibility Levels

| Metric | Value |
|---|---|
| User Stories | 1 |
| Components | 1 |
| Functions | 5 |

Not every profile field should be visible to everyone at the same time. This module introduces three visibility levels that control when which information is shown to a match partner. Sensitive data (income, health, kinks) remains algorithm-only until both sides decide to unlock.

---

## Visibility Levels

| Level | Name | Visible to | Examples |
|---|---|---|---|
| **Level 1** | Algorithm only | Nobody (only the matching algorithm) | Income, sexual preferences, kinks, health information |
| **Level 2** | Match preview | After proposal, before unlock | Age, core values, intention, hobbies, rough region |
| **Level 3** | After unlock | After mutual consent (SOL-5) | Name, exact location, photos, free texts, contact |

---

## User Stories

- US-16.1: Staged Visibility of Profile Data


## Edge Cases (SOL-16)

| # | Scenario | Rule |
|---|---|---|
| EC-16.1 | **User sets everything to Level 1** | The system enforces a minimum set of Level-2 fields (e.g. age, intention, rough region) so that the match preview is not empty. The user is informed which fields cannot be set to Level 1. |
| EC-16.2 | **User changes visibility after unlock** | Already unlocked matches retain their current visibility. A visibility reduction applies only to future new matches. |
| EC-16.3 | **Level-1 fields in SOL-9 compatibility breakdown** | The SOL-9 breakdown (Why This Match?) must never reveal Level-1 fields (FN-16.1.1.5). Generic paraphrases are used instead (e.g. "compatibility in the personal area rated as high"). |