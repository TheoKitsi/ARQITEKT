---
type: solution
id: SOL-14
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-14: Inactivity Management

| Metric | Value |
|---|---|
| User Stories | 1 |
| Components | 1 |
| Functions | 4 |

"Dead profiles" — inactive profiles that never respond — degrade match quality for all active users. This module automatically removes inactive profiles from the matching pool and provides a pause mode for temporary absence.

---

## User Stories

- US-14.1: Only Active Profiles in Matching Pool


## Edge Cases (SOL-14)

| # | Scenario | Rule |
|---|---|---|
| EC-14.1 | **Deactivation with active chats** | Existing chats are "frozen" (not deleted). Chat partners see the status "User currently not active." On reactivation, the chat resumes seamlessly. (-> SOL-5, EC-5.6) |
| EC-14.2 | **Deactivation with open interests** | All pending (unanswered) interest expressions to the deactivated user expire automatically. The interested user is informed: "The proposal is no longer available." No details about the reason. |
| EC-14.3 | **Pause mode and subscription** | The subscription continues running during pause. The user is informed when activating it. (-> SOL-6, EC-6.2) |
| EC-14.4 | **Reactivation — outdated data** | On reactivation after long inactivity (> 3 months): the system prompts the user to review their core data (without forcing changes). Message: "Some time has passed since your last activity — are your details still accurate?" Seriousness score (SOL-13) is gradually rebuilt after reactivation. |
| EC-14.5 | **User ignores deactivation reminders** | If 2-3 reminders remain unanswered, automatic deactivation occurs without further warning. The user can reactivate at any time by logging in. |