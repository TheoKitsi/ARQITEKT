---
type: solution
id: SOL-5
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-5: Mutual Consent Before Contact

| Metric | Value |
|---|---|
| User Stories | 1 |
| Components | 2 |
| Functions | 8 |

No user can be contacted without mutual consent. Match proposals are initially shown as an anonymous preview. Only when both sides express interest is contact enabled and an encrypted chat activated.

---

## User Stories

- US-5.1: Mutual Interest Declaration Before Contact


## Edge Cases (SOL-5)

| # | Scenario | Rule |
|---|---|---|
| EC-5.1 | **Interest without response (Timeout)** | If a user expresses interest and the other person does not respond within 14 days, the interest expires automatically. The interested user is notified: "No response — the proposal has been archived." No re-proposal of the same profile for at least 6 months (unless profile changes on both sides produce a new match score). |
| EC-5.2 | **Rejected match — permanent exclusion?** | A rejected match proposal is permanently removed from the proposal list. The same person is not proposed again — unless significant profile changes on both sides produce a markedly higher score (>= 15% improvement). In that case: one-time re-suggest with label "Updated profile". |
| EC-5.3 | **Block during active chat** | On blocking, the chat is immediately deactivated. Chat history remains archived for the blocking user (accessible for support); for the blocked user, the chat is shown as "no longer available". The blocked user receives no hint about the block — the message reads neutrally "Chat ended". |
| EC-5.4 | **Mutual block** | When both users block each other, the connection is fully dissolved. Neither side can ever see the other in matching again, even if one side lifts their block. Unblocking requires BOTH sides to lift their block. |
| EC-5.5 | **Report without block** | If a user files a report but does not block: the chat remains active, the report is forwarded to moderation. The system recommends the reporting user to block — but does not enforce it. |
| EC-5.6 | **Deactivated/paused user with open chat** | When a user is deactivated (SOL-14) or paused: existing chats are "frozen" — not deleted. The chat partner sees the status "User currently not active". On reactivation/unpausing, the chat resumes seamlessly. |