---
type: solution
id: SOL-17
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-17: Exit Interview on Account Deletion

| Metric | Value |
|---|---|
| User Stories | 1 |
| Components | 1 |
| Functions | 5 |

Every platform deserves to know why users leave. This module offers an optional, anonymous exit interview during the account deletion process. The key question: "Did you find a partner?" --- the only true success metric of the platform.

---

## User Stories

- US-17.1: Voluntary Exit Survey on Account Deletion


## Edge Cases (SOL-17)

| # | Scenario | Rule |
|---|---|---|
| EC-17.1 | **Process order** | Strict sequence: 1. Exit interview (optional), 2. Anonymize personal data, 3. Delete account. The interview must be captured BEFORE data is deleted. |
| EC-17.2 | **User aborts during interview** | If the user cancels the interview midway: all captured data is discarded, the account is deleted immediately without interview data. |
| EC-17.3 | **Active chats at deletion** | All active chats are terminated. The match partner sees the message "User has left the platform." No further details. |
| EC-17.4 | **Running subscription** | An active subscription is cancelled immediately upon deletion. Remaining duration is not refunded (terms of service note). Alternatively: account remains active until the paid period ends (configurable). |