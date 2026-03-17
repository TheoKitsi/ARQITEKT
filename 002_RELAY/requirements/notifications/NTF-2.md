---
type: Notification
id: NTF-2
title: "Candidacy Notifications"
status: draft
version: "1.0"
date: "2025-07-14"
---

# NTF-2: Candidacy Notifications

## Trigger Events

| Event | Recipients | Channels | SLA |
|---|---|---|---|
| Candidacy submitted | Candidate | Email, In-App | < 60 sec |
| Candidacy withdrawn | Listing Tenant | In-App | < 5 min |
| Candidate accepted | Candidate | Email, In-App | Immediate |
| Candidate rejected | Candidate | Email, In-App | < 24 hours |
| Runner-up promoted | Promoted Candidate | Email, In-App | Immediate |
| New candidacy received | Listing Tenant | In-App | < 5 min |
| Verification expired | Candidate | Email, In-App | Immediate |

## Content Requirements

- Candidacy confirmation shall include candidacy ID and listing title.
- Rejection notifications shall include the reason category (no free text to candidates).
- Runner-up promotion shall explain the new status and any required actions.
- Verification expiry notifications shall include a link to re-verify via TrustGate.