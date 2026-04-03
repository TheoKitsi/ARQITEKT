---
name: Business Case Skill
description: Knowledge for creating and evaluating business cases. Used by @discover agent.
---

# Business Case — Skill Reference

## Purpose

A Business Case (BC) is the **root document** of an ARQITEKT project. It defines the business objective, scope, monetization, and success criteria — everything else derives from it.

## Template

-> `requirements/templates/business-case.md`

## Interview Questions (for @discover Agent)

The @discover agent asks these questions to generate a BC. Not all are mandatory — the agent recognizes which are relevant.

### Phase 1: Vision & Problem (Mandatory)

1. **What is the core idea in one sentence?**
2. **What problem does it solve? What is missing in the market?**
3. **Who is the product for? (Target audience, persona)**
4. **What differentiates it from existing solutions?**

### Phase 2: Scope & Functionality (Mandatory)

5. **What are the 3-5 most important features?**
6. **What is explicitly NOT included? (Out of scope)**
7. **Is there a priority order for features?**

### Phase 3: Business & Monetization (Recommended)

8. **How will money be made? (Subscription, freemium, pay-per-use, advertising, ...)**
9. **What are the success criteria / KPIs?**
10. **Are there regulatory requirements? (GDPR, industry-specific)**

### Phase 4: Technical Constraints (Optional)

11. **Which platform? (Web, mobile, desktop, cross-platform)**
12. **Are there existing systems/APIs that must be integrated?**

## Quality Criteria

A good BC has:

- [ ] **Clear business objective** — Understandable in 2-3 sentences what is being built
- [ ] **Defined scope** — In-scope AND out-of-scope
- [ ] **Identified target audience** — Who uses it?
- [ ] **Monetization** — How will money be made (or: Why not)?
- [ ] **Core principles** — 3-7 guiding principles that define the product
- [ ] **Requirements tree-map** — Overview of all SOLs with their hierarchy
- [ ] **Glossary** — Domain terms used in the project
- [ ] **Measurable success criteria** — KPIs with target values

## From BC to SOLs

After BC creation, the agent proposes SOL decomposition:
1. Read business objective + scope
2. Identify independent feature areas
3. Each area = one SOL
4. Typical: 5-20 SOLs per BC
5. Group SOLs logically (Core, UX, Security, Monetization, ...)

## Anti-Patterns

- BC too vague: "We build an app" — no clear problem/solution
- BC too technical: BC describes WHAT and WHY, not HOW
- No scope: Everything is "in scope" — project never finishes
- Feature list instead of vision: BC is not a feature list — it gives direction
- No glossary: When the team uses different terms for the same thing
