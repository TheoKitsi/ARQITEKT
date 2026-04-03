---
name: Infrastructure Skill
description: Knowledge for creating and evaluating infrastructure requirements. Used by @architect and @review.
---

# Infrastructure — Skill Reference

## Purpose

An Infrastructure requirement (INF) defines a **non-functional, cross-cutting technical constraint** — performance, security, deployment, scalability, compliance, or tooling that affects multiple components.

## Template

-> `requirements/templates/infrastructure.md`

## Mandatory Sections

### 1. Infrastructure Description (required)

"The system shall..." paragraph(s) defining the infrastructure requirement in imperative form.

### 2. Non-Functional Constraints (required)

Measurable constraints: latency, throughput, availability, security level.

### 3. Affected Requirements (required)

Which SOLs, CMPs, or FNs does this INF affect?

### 4. Verification Criteria (required)

How is this requirement verified? (Load test, pen test, audit, monitoring)

### 5. Tooling (optional)

Recommended tools or services (but not mandated unless constraint).

## Quality Criteria

- [ ] **Measurable** — Numbers, not "fast" or "secure"
- [ ] **Affected requirements linked** — Not an island
- [ ] **Verification method defined** — How to prove compliance?
- [ ] **"The system shall..." formulation** — Imperative, not descriptive

## INF Categories

| Category | Example |
|---|---|
| Performance | "API responses within 200ms at P95" |
| Availability | "99.9% uptime, max 8h unplanned downtime/year" |
| Security | "All PII encrypted at rest with AES-256" |
| Scalability | "Support 10,000 concurrent users" |
| Compliance | "GDPR-compliant data deletion within 30 days" |
| Deployment | "Zero-downtime deployment via blue-green" |
| Monitoring | "All errors logged with correlation ID" |
| Backup | "Daily backup with 30-day retention, RPO < 1h" |

## Anti-Patterns

- Vague INF: "The system should be fast." — Define numbers.
- Orphan INF: Infrastructure requirement linked to nothing — who needs it?
- Gold-plating: "99.999% availability" for an MVP — be realistic
- No verification: "Secure system" — how do you prove it?
