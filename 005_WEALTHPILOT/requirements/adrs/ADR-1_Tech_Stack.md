---
type: adr
id: ADR-1
title: "Tech Stack Auswahl"
status: approved
version: "1.0"
date: "2026-03-15"
deciders: ["kitsi"]
superseded_by: null
---

# ADR-1: Tech Stack Auswahl

> **Status**: accepted
> **Date**: 2026-03-15
> **Deciders**: kitsi

---

## Context

WealthPilot ist eine B2B-SaaS-Plattform mit komplexen Berechnungen (Monte-Carlo-Simulation), Echtzeit-Visualisierungen, KI-Integration und Multi-Tenant-Architektur. Der Tech Stack muss: hohe Entwicklerproduktivitaet bieten, starkes Typsystem fuer Finanzmathematik, performante API fuer Berechnungen, modernes Frontend fuer interaktive Charts.

---

## Decision

**Frontend: Next.js 14+ (App Router) mit TypeScript, Tailwind CSS, Material UI (M3)**
**Backend: Node.js mit NestJS (TypeScript), PostgreSQL, Redis**
**Infrastructure: Docker, Kubernetes, Terraform (GCP/AWS)**

---

## Reasoning

- **TypeScript Full-Stack**: Ein Typsystem fuer Frontend und Backend, geteilte Interfaces fuer Finanzdatenmodelle
- **Next.js**: SSR fuer SEO-irrelevant aber Server Components fuer Performance, App Router fuer modulare Architektur
- **NestJS**: Enterprise-Grade DI, modulare Architektur, OpenAPI-Generierung, ideal fuer Multi-Tenant
- **PostgreSQL**: ACID-Transaktionen fuer Finanzdaten, JSONB fuer flexible Schemas, Row-Level-Security fuer Multi-Tenant
- **Redis**: Rendite-Cache, Session-Store, Rate-Limiting, Pub/Sub fuer Echtzeit-Updates
- **M3 Design System**: Konsistente UI, Theming-faehig fuer White-Label

---

## Alternatives Considered

| Alternative | Pro | Contra | Rejected because |
|---|---|---|---|
| Python/Django Backend | Gute ML-Libraries, schnelles Prototyping | Zwei Sprachen, kein geteiltes Typsystem, GIL fuer Concurrency | TypeScript-Einheitlichkeit wiegt staerker; ML nicht core |
| Go Backend | Exzellente Performance, Concurrency | Kleineres Oekosystem fuer ORM/DI, steilere Lernkurve | NestJS-Produktivitaet bei vergleichbarer Performance ausreichend |
| Vue.js / Nuxt | Einfacherer Einstieg | Kleiner Talent-Pool, schwaecher typisiert | React-Oekosystem groesser fuer Chart-Libraries |
| MongoDB | Flexibles Schema | Keine ACID-Transaktionen, Finanzdaten brauchen Konsistenz | PostgreSQL-Zuverlaessigkeit fuer Finanzdomaene |

---

## Consequences

### Positive

- Einheitliche TypeScript-Codebasis reduziert Context-Switching
- NestJS-Module mappen 1:1 auf SOL/CMP-Struktur
- PostgreSQL Row-Level-Security vereinfacht Multi-Tenant-Isolation
- Grosses Oekosystem fuer alle Anforderungen (Charts, PDF, PSD2)

### Negative

- Node.js Single-Thread: CPU-intensive Monte-Carlo muss in Worker-Threads
- Next.js App Router noch in Evolution, Breaking Changes moeglich

### Risks

- Worker-Thread-Performance fuer Monte-Carlo: Benchmark frueh, ggf. Rust/WASM-Fallback
- NestJS-Lock-in: Abstractions-Layer fuer Portabilitaet einplanen

---

## Affected Requirements

| Requirement | Impact |
|---|---|
| CMP-4.2.1 | Monte-Carlo in Worker-Threads oder WASM |
| CMP-10.2.1 | M3 Theming + CSS Custom Properties fuer White-Label |
| SOL-10 | PostgreSQL RLS fuer Mandantentrennung |
| CMP-7.1.1 | Elasticsearch separat fuer Produktsuche |

---

## References

- NestJS Documentation: https://docs.nestjs.com
- Next.js App Router: https://nextjs.org/docs/app
- PostgreSQL Row-Level Security: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
