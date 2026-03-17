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

Web-based single-page application providing the user interface for listing tenants, candidates, landlords, and platform operators.

## Specification

| Property | Value |
|---|---|
| Framework | React 19+ / Next.js 15+ |
| Styling | Tailwind CSS with M3-inspired design tokens |
| State Management | TanStack Query for server state |
| Authentication | OIDC integration with Keycloak |
| Accessibility | WCAG 2.1 AA compliance required |
| Hosting | Vercel or Cloudflare Pages |

## Key Views

- Listing management (create, edit, criteria, publish)
- Candidate application flow
- Landlord shortlist and decision view
- Badge card rendering
- Platform operator dashboard (audit search, alerts)