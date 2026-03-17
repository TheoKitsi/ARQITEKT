---
type: solution
id: SOL-7
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-7: Data Protection and Security Concept

| Metric | Value |
|---|---|
| User Stories | 1 |
| Components | 2 |
| Functions | 10 |

The platform processes highly sensitive personal data — values, sexuality, preferences, health, income. Data protection and security are therefore not optional but constitutive for the entire system. All data processing is GDPR-compliant and purpose-bound.

---

## User Stories

- US-7.1: Data Protection and Purpose Limitation


## Edge Cases (SOL-7)

| # | Scenario | Rule |
|---|---|---|
| EC-7.1 | **Data retention periods** | Personal profile data: deletion on account deletion. Billing data: 10 years (statutory retention). Audit logs: 2 years. Anonymized analytics data (SOL-15, SOL-17): unlimited (no personal reference). ID verification hashes: deletion on account deletion, plaintext ID data is never stored (SOL-1 AC-1.2.4). |
| EC-7.2 | **Data export format** | GDPR export (FN-7.1.1.4) includes: profile data (JSON), chat histories (JSON), matching history (JSON), uploaded images (original format), billing data (PDF). Export within 30 days of request. |
| EC-7.3 | **2FA loss** | If the user loses their second factor (e.g. new phone), they can reset 2FA via a verified backup channel (email + ID verification). No bypass of 2FA without proof of identity. |