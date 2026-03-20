---
name: Functions Skill
description: Knowledge for creating and evaluating functional requirements. Used by @architect and @review.
---

# Functions — Skill Reference

## Purpose

A Function (FN) is the **most granular requirement** in the hierarchy. It describes one specific system behavior within a component — with preconditions, postconditions, and mandatory error handling.

## Template

-> `requirements/templates/function.md`

## Mandatory Sections

### 1. Functional Description (required)

Bulleted list of "The system shall..." statements describing exact system behavior.

**Good example** (meterverse style):
> - The system shall allow a logged-in user to create a new activity by submitting a title, description, category, estimated duration, and optional cover image.
> - The system shall validate that the title is between 5 and 120 characters and the description does not exceed 2000 characters.
> - The system shall return a confirmation with the newly created activity ID upon successful creation.

**Bad example**:
> - Activities can be created. — No "shall", no specifics.

### 2. Preconditions (required)

What must be true BEFORE this function can execute.

### 3. Behavior (required)

Step-by-step description of the function's execution flow.

### 4. Postconditions (required)

What is guaranteed to be true AFTER successful execution.

### 5. Error Handling (required)

Bulleted list of "The system shall..." statements for error scenarios.

**Good example**:
> - The system shall return HTTP 400 if required fields are missing or validation fails.
> - The system shall return HTTP 413 if the uploaded image exceeds the maximum size of 5 MB.
> - The system shall return HTTP 409 if an activity with an identical title already exists for the same provider.

## Quality Criteria

- [ ] **"The system shall..." bullets in Functional Description** — Every behavior stated imperatively
- [ ] **Preconditions defined** — At least 1 (e.g.: "User is authenticated")
- [ ] **Postconditions defined** — What state results from success?
- [ ] **Error Handling present** — At least 2-3 error scenarios with "shall" formulation
- [ ] **Testable** — A developer can write automated tests from this
- [ ] **Atomic** — One function = one behavior. If "and" appears too often -> split

## Function Granularity

| Too coarse | Right | Too fine |
|---|---|---|
| "Manage users" | "Create user account" | "Validate email format" |
| "Process payment" | "Charge credit card" | "Parse card number" |
| "Handle search" | "Search activities by keyword" | "Tokenize search query" |

## Error Handling Patterns

| Category | Example |
|---|---|
| Validation | "The system shall return HTTP 400 if required fields are missing." |
| Authorization | "The system shall return HTTP 403 if the user lacks the required role." |
| Not Found | "The system shall return HTTP 404 if the referenced resource does not exist." |
| Conflict | "The system shall return HTTP 409 if the entity was modified concurrently." |
| Rate Limit | "The system shall return HTTP 429 if the request limit is exceeded." |
| External failure | "The system shall return HTTP 502 if the external service is unreachable." |

## Anti-Patterns

- Feature-FN: "The system shall support user management." — Not atomic.
- No error handling: Every FN can fail — if no errors documented, the FN is incomplete.
- Implementation FN: "The system shall use bcrypt to hash passwords." — Describe WHAT, not HOW.
- Passive FN: "The password is hashed." — Use imperative: "The system shall hash..."
- And-FN: "The system shall create and verify and send..." — Split into 3 FNs.