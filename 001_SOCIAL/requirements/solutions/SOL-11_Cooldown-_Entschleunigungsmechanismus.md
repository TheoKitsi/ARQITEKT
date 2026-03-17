---
type: solution
id: SOL-11
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-11: Cooldown / Deceleration Mechanism

| Metric | Value |
|---|---|
| User Stories | 1 |
| Components | 1 |
| Functions | 4 |

Endless swiping destroys seriousness. On this platform, users receive a **limited number of high-quality, curated match proposals** per time period. Each proposal is worth examining thoroughly. Quality over quantity — the central unique selling proposition.

---

## User Stories

- US-11.1: Limited High-Quality Match Proposals Per Period


## Edge Cases (SOL-11)

| # | Scenario | Rule |
|---|---|---|
| EC-11.1 | **All quota proposals declined** | If a user declines all daily proposals: no replenishment until the next cycle. No "unlock 5 more". Message: "Your next proposal arrives tomorrow." |
| EC-11.2 | **Fewer qualified matches than quota** | If e.g. only 2 matches meet the minimum score but the quota would be 5: only 2 are delivered. Quality always takes precedence over quota. Message: "Today we have 2 particularly fitting proposals for you." |
| EC-11.3 | **Premium upgrade mid-cycle** | On upgrade from Basic to Premium, the extended quota activates immediately — not only in the next cycle. Already consumed proposals are credited. |