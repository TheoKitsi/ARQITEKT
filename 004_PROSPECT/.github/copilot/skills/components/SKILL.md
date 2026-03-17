---
name: Components Skill
description: Knowledge for creating and evaluating components. Used by @architect and @review.
---

# Components — Skill Reference

## Purpose

A Component (CMP) is a **technical building block** that implements one aspect of a user story. It describes WHAT the component does, its responsibility boundary, which functions it contains, its constraints, and relevant infrastructure references.

## Template

-> `requirements/templates/component.md`

## Mandatory Sections

### 1. Responsibility (required)

A precise "The system shall..." paragraph defining the component's purpose.

**Good example** (meterverse style):
> The system shall provide a centralized catalog of all available activities within the platform. This component is responsible for storing, retrieving, and organizing activities — including metadata such as title, description, category, duration, and associated media. It acts as the single source of truth for activity information consumed by other components such as scheduling, booking, and discovery.

**Bad example**:
> This component handles activities. — Too vague, not "shall"-formulated.

### 2. Interfaces (required)

List of APIs, events, or data flows this component exposes or consumes.

### 3. Functions (required)

Table linking to FN files with ID, title, status.

### 4. Constraints (required)

Technical constraints the component must satisfy (performance, security, compatibility).

### 5. Infrastructure References (optional)

Links to INF files that this component depends on.

## Quality Criteria

- [ ] **"The system shall..." in Responsibility** — One or more paragraphs, imperative
- [ ] **Clear boundary** — What is in, what is out
- [ ] **1-5 Functions** — Fewer = component too small. More = split.
- [ ] **Constraints present** — At least 1 technical constraint
- [ ] **Interfaces defined** — Input/Output, events, APIs
- [ ] **No implementation details** — No code, no specific frameworks unless constraint

## From US to CMP Heuristics

| Pattern in US/ACs | -> CMP Type |
|---|---|
| UI interaction / form / modal | UI Component |
| Data persistence / CRUD | Data / Repository Component |
| Business rule / validation | Logic / Service Component |
| External API call | Integration Component |
| Notification sending | Notification Component |
| Authentication / authorization | Auth Component |

## CMP Granularity Guide

| Too coarse | Right | Too fine |
|---|---|---|
| "User Management" (everything) | "Registration Form" | "Email Input Field" |
| "Backend" | "Verification Service" | "Hash Function" |
| "Data Layer" | "Profile Repository" | "SQL Query Builder" |

## Anti-Patterns

- God-CMP: One component does everything — split by responsibility
- Anemic CMP: Only a passthrough, no own logic — merge into caller
- No constraints: Every component has technical boundaries — if none documented, not enough thought given
- Implementation CMP: "React Component for..." — describe the WHAT, not the HOW
- Missing interfaces: A component without interfaces is disconnected