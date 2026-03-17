---
type: solution
id: SOL-3
status: draft
parent: BC-1
version: "1.0"
date: "2026-03-10"
---

# SOL-3: Intelligent Text-Based Matching Algorithm

| Metric | Value |
|---|---|
| User Stories | 2 |
| Components | 3 |
| Functions | 13 |

The matching engine is the algorithmic heart of the platform. It computes bidirectional compatibility on the basis of the 5-level funnel profiles, weighted by user prioritization, and filters deal-breakers as knockout criteria. Matching is **transparent** — every proposal is explained.

---

## Matching Logic

Profile A (Self)     --+
                       +--> Matching Engine --> Score A->B (%)
Profile B (Target of A)--+

Profile B (Self)     --+
                       +--> Matching Engine --> Score B->A (%)
Profile A (Target of B)--+

Overall Score = f(Score A->B, Score B->A) --> only if >= minimum score -> proposal

---

## User Stories

- US-3.1: Transparent Compatibility Calculation
- US-3.2: Quality Improvement Through Fuller Profile


## Edge Cases (SOL-3)

| # | Scenario | Rule |
|---|---|---|
| EC-3.1 | **No suitable matches available** | If no profile reaches the minimum score, the user receives a transparent message: "Currently no suitable proposals — we keep searching." No empty lists, no lowering of the minimum score without user consent. Optional: hint to widen tolerance ranges or deal-breakers. |
| EC-3.2 | **Re-matching after profile change** | Every profile change (SOL-6) triggers a re-match: (1) Existing active chats remain, but the match score is updated and displayed. (2) If a deal-breaker is violated by the change, the affected user receives a hint (not the change detail, only "Compatibility has changed"). (3) New match proposals are calculated on the updated profile. |
| EC-3.3 | **NLP language support** | NLP analysis (FN-3.1.1.5) initially supports German and English. Free-text entries in other languages are marked as "not analyzable" and do not feed into the score — the user is informed and invited to enter in a supported language. |
| EC-3.4 | **Bidirectional score strongly asymmetric** | When A->B > 90% but B->A < 60%: The system shows the higher-scoring user the averaged / lower score — no inflation of expectations. The overall score always reflects the weaker direction. |
| EC-3.5 | **Both profiles levels 4-5 empty** | Matching is based on levels 1-3 only. The score is technically correct, but a hint is displayed: "Matching accuracy limited — optionally add more details in levels 4-5." |