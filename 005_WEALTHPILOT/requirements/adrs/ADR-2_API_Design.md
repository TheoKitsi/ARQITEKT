---
type: adr
id: ADR-2
title: "API Design REST mit OpenAPI"
status: approved
version: "1.0"
date: "2026-03-15"
deciders: ["kitsi"]
superseded_by: null
---

# ADR-2: API Design REST mit OpenAPI

> **Status**: accepted
> **Date**: 2026-03-15
> **Deciders**: kitsi

---

## Context

WealthPilot braucht eine API-Strategie fuer: interne Frontend-Backend-Kommunikation, externe B2B-API fuer Integratoren (SOL-10), PSD2-Provider-Anbindung. Die API muss versioniert, dokumentiert und mandantenfaehig sein.

---

## Decision

**REST API mit OpenAPI 3.1 Spezifikation, versioniert ueber URL-Pfad (/api/v1/), generierte Client-SDKs.**

---

## Reasoning

- REST ist fuer B2B-Kunden (Banken, Versicherer) der erwartete Standard
- OpenAPI 3.1 ermoeglicht automatische Dokumentation und Client-Generierung
- NestJS generiert OpenAPI-Specs aus Decorators (swagger-nestjs)
- URL-basierte Versionierung (/api/v1/) ist einfachster Ansatz fuer B2B
- Server-Sent Events (SSE) fuer Gemini-Streaming (kein WebSocket noetig)

---

## Alternatives Considered

| Alternative | Pro | Contra | Rejected because |
|---|---|---|---|
| GraphQL | Flexibles Querying, weniger Over-Fetching | Komplexeres Caching, B2B-Kunden erwarten REST, Security-Komplexitaet | Enterprise-B2B-Kontext bevorzugt REST |
| gRPC | Hohe Performance, Streaming | Browser-Inkompatibilitaet, komplexer fuer B2B-Partner | Nicht Webfrontend-kompatibel ohne Proxy |
| tRPC | End-to-End-Typsicherheit | Nur mit TypeScript-Clients, kein externer SDK | B2B-API muss sprachunabhaengig sein |

---

## Consequences

### Positive

- Automatisch generierte API-Docs auf /api/docs
- TypeScript-Client via openapi-typescript-codegen
- B2B-Partner erhalten OpenAPI-Spec fuer eigene Codegen
- SSE fuer Streaming ohne WebSocket-Komplexitaet

### Negative

- REST Over-Fetching fuer Dashboard (viele Aggregate): ggf. Custom-Endpoints
- Versionierung erfordert disziplinierten Deprecation-Prozess

### Risks

- API-Break zwischen v1 und v2: Deprecation-Zeitraum von 6 Monaten definieren

---

## Affected Requirements

| Requirement | Impact |
|---|---|
| FN-10.1.1.4 | API-Key-Verwaltung fuer externe API-Zugriffe |
| CMP-5.1.1 | SSE-Endpunkt fuer Gemini-Streaming |
| CMP-2.1.1 | PSD2-Webhooks fuer asynchrone Kontoabfragen |
| SOL-10 | B2B-API: OpenAPI-Spec als Vertragsgrundlage |

---

## References

- OpenAPI 3.1 Specification: https://spec.openapis.org/oas/v3.1.0
- NestJS Swagger Module: https://docs.nestjs.com/openapi/introduction
