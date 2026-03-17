---
type: Infrastructure
id: INF-4
title: "Frontend Application"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-4: Frontend Application

## Purpose
Progressive Web Application serving the SOCIAL user interface: onboarding funnel,
profile management, matching dashboard, consent workflows, and reflection screens.

## Specification
| Property | Value |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Rendering | SSR for public pages, CSR for authenticated flows |
| Styling | Tailwind CSS with SOCIAL design tokens (#FF4081, #1A1A2E, Poppins) |
| Accessibility | WCAG 2.1 AA compliance |
| i18n | next-intl, initial languages: DE, EN, EL |
| Dark Mode | Default dark theme with optional light mode toggle |

## Key Modules
- Reflective Onboarding Assistant (SOL-8) — guided multi-step questionnaire.
- 5-Level Funnel Profile editor (SOL-2) — progressive disclosure per level.
- Matching dashboard — curated proposals with compatibility reflection (SOL-9).
- Consent gate (SOL-5) — mutual opt-in before messaging.
- Cooldown overlay (SOL-11) — deceleration UI with timer visualization.

## Deployment
- Containerized via Docker, deployed to Vercel or AWS ECS.
- Environment-based configuration (staging, production).
- Lighthouse CI gate: Performance > 90, Accessibility > 95.
