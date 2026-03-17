---
type: solution
id: SOL-10
title: "White-Label & B2B-Plattform"
status: approved
parent: BC-1
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: []
  downstream: []
---

# SOL-10: White-Label & B2B-Plattform

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: keine | downstream: keine





---

## System Boundaries

### In Scope

- Mandanten-Anlage mit Subdomain und Lizenzmodell.
- Feature-Flag-Konfiguration pro Mandant.
- SSO-Konfiguration (SAML 2.0 / OIDC).
- API-Key-Management.
- White-Label-Branding (Logo, Farben, Texte, Live-Preview).

### Out of Scope

- Billing / Abrechnungsintegration.
- Multi-Region-Deployment.
- Eigene Mandanten-App-Stores.

---

## User Story Index

| US-ID | Title | Status |
| --- | --- | --- |
| [US-10.1](../user-stories/US-10.1_Mandanten_Konfiguration_verwalten.md) | Mandanten Konfiguration verwalten | draft |
| [US-10.2](../user-stories/US-10.2_White_Label_Branding_anwenden.md) | White Label Branding anwenden | draft |

---

## Architecture Context

Frontend: Admin-Panel (Super-Admin) | Backend: NestJS Mandant-Service | Auth: SAML 2.0 / OIDC Adapter | DB: PostgreSQL (mandant_config, feature_flags) | CDN: Logo/Asset-Storage

---

## Edge Cases (SOL-10)

| # | Szenario | Regel |
|---|---|---|
| EC-10.1 | **Mandant hat keinen SSO-Provider** | Fallback: Lokale Authentifizierung (E-Mail + Passwort) mit Pflicht zur 2FA. Migration zu SSO jederzeit möglich. |
| EC-10.2 | **Daten-Isolation zwischen Mandanten** | Strikte Mandantentrennung auf Datenbankebene (Schema-per-Mandant oder Row-Level-Security). Kein Cross-Mandant-Zugriff, auch nicht für Admins. |
| EC-10.3 | **Mandant deaktiviert Modul (z.B. KI-Beratung)** | Feature-Flags per Mandant. Deaktivierte Module: Menüpunkt ausgeblendet, API-Endpunkte returnieren 403. |
| EC-10.4 | **Corporate Design kollidiert mit UX-Anforderungen** | Branding-Editor hat Validierung: Mindest-Kontrast (WCAG AA), Mindest-Button-Größe, Pflichtfelder für Logo und Primärfarbe. |
