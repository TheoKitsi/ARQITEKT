---
type: Infrastructure
id: INF-5
title: "Frontend Application"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-5: Frontend Application

## Purpose

Web application serving the owner dashboard, candidate portal, and property manager views.

## Specification

- **Framework:** React 18+ with TypeScript
- **Component Library:** M3 Material Design system
- **State Management:** React Query for server state, Zustand for client state
- **Build:** Vite, deployed to CDN (CloudFront or equivalent)
- **Authentication:** OAuth 2.0 / OIDC (shared with Messkraft identity)

## Key Views

- Owner: Search creation, shortlist review, viewing management, decision tracking
- Candidate: Pool profile management, match inquiries, viewing scheduling
- Property Manager: Delegated search management

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse score: > 90

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation for all workflows
- Screen reader support for critical paths