---
type: solution
id: SOL-13
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-13: Trust and Seriousness System

| Metric | Value |
|---|---|
| User Stories | 1 |
| Components | 1 |
| Functions | 5 |

Verification alone says nothing about a user's active seriousness. The seriousness score continuously evaluates how serious and engaged a user is — based on multiple factors. Profiles with a high score are prioritized in matching; users with a declining score receive improvement suggestions.

---

## User Stories

- US-13.1: Seriousness Indicator for Matches


## Edge Cases (SOL-13)

| # | Scenario | Rule |
|---|---|---|
| EC-13.1 | **Seriousness score after pause/deactivation** | On reactivation after pause (SOL-14): score is not reset to 0 but starts at the last level minus a small deduction for inactivity. Gradual rebuilding through active usage. |
| EC-13.2 | **New user without history** | New users receive a neutral initial score (e.g. "Medium / Yellow") that neither favors nor disadvantages. The score builds up through activity within the first 2 weeks. |
| EC-13.3 | **Response behavior definition** | "Response behavior" (FN-13.1.1.1) measures: (1) response rate to match proposals (interest/decline within 48h), (2) response speed in chat after unlock. Non-response to proposals lowers the score; chat speed is a moderate factor. |