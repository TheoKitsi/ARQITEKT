---
type: solution
id: SOL-1
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-1: Verified Registration & Identity Verification

| Metric | Value |
|---|---|
| User Stories | 2 |
| Components | 2 |
| Functions | 7 |

Verification ensures that only real, uniquely identified individuals use the platform. This is the foundation for trust and seriousness — without verification, no access to matching.

---

## User Stories

- [US-1.1: Multi-Step Verification](../user-stories/US-1.1_Mehrstufige_Verifizierung.md)
- [US-1.2: Uniqueness / Duplicate Prevention](../user-stories/US-1.2_Eindeutigkeit_Duplikatverhinderung.md)


## Edge Cases (SOL-1)

| # | Scenario | Rule |
|---|---|---|
| EC-1.1 | **ID document check fails** | The user receives a clear error message with the specific rejection reason (e.g., "Document unreadable", "Expired") and may upload a new document up to 3 times. After 3 failed attempts, the account is locked and a support ticket is created. |
| EC-1.2 | **Dispute against duplicate detection** | The user can clarify their case via the support ticket. Manual review by support team — no automatic unblocking. |
| EC-1.3 | **Age verification against ID document** | During ID upload (FN-1.1.1.3), the date of birth is checked against the age stated in the profile. If there is a discrepancy, registration is rejected (minimum age 18, see also SOL-2 FN-2.5.1.6). |
| EC-1.4 | **Wait time during manual ID review** | Since FN-1.1.1.5 excludes profile creation before full verification, a status page with estimated wait time is displayed during manual review. Push notification upon completion. |

---