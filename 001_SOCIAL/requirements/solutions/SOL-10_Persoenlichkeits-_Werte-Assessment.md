---
type: solution
id: SOL-10
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-10: Personality and Values Assessment

| Metric | Value |
|---|---|
| User Stories | 1 |
| Components | 1 |
| Functions | 6 |

Standard profile fields (dropdown, slider) capture personality only superficially. This optional assessment is based on scientifically validated models (Big Five, Attachment Styles, Schwartz Values) and generates an in-depth personality profile that feeds into the matching algorithm as an additional factor.

---

## User Stories

- US-10.1: Optional Scientifically Founded Personality Test


## Edge Cases (SOL-10)

| # | Scenario | Rule |
|---|---|---|
| EC-10.1 | **Test result contradicts SOL-2 level 2 self-assessment** | If the Big Five test yields e.g. "strongly introverted" but the user self-assessed as "extraverted" in level 2 (SOL-2): the system transparently shows the discrepancy and offers the user to either (a) adjust the self-assessment in level 2 or (b) manually correct the test result (FN-10.1.1.5). In matching, *both* data points are considered — the test with higher weighting unless manually corrected. |
| EC-10.2 | **Test only partially completed** | An interrupted test is not saved and has no effect on matching. The user can start a new attempt at any time. |
| EC-10.3 | **Test repetition with significantly different result** | On repetition, the latest result applies (AC-10.1.6). The old result is archived (not deleted) but not used in matching. No limit on repetitions. |