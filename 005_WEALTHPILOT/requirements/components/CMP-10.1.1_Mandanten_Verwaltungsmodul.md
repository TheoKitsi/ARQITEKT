---
type: component
id: CMP-10.1.1
status: draft
parent: US-10.1
version: "1.0"
date: "2026-03-15"
---

# CMP-10.1.1: Mandanten Verwaltungsmodul

## Beschreibung

Admin-Interface fuer Plattform-Betreiber. CRUD fuer Mandanten mit: Firmenname, Domain-Mapping, Vertragslaufzeit, Feature-Flags. SSO-Konfiguration: SAML 2.0 und OpenID Connect mit Metadaten-Import. API-Key-Management: Generierung, Rotation, Revocation. Nutzerlimits und Usage-Tracking fuer Abrechnung.

---

## Interfaces

| Direction | Description |
|---|---|
| **Input** | Admin-Eingaben: Firmenname, Domain, Vertragslaufzeit, Feature-Flags, SSO-Config |
| **Output** | Mandanten-Objekt mit Konfiguration, API-Keys, SSO-Metadaten |


---

## Functions

| FN-ID | Function | Status |
|---|---|---|
| [FN-10.1.1.1](../functions/FN-10.1.1.1_Mandant_Anlegen.md) | Mandant Anlegen | draft |
| [FN-10.1.1.2](../functions/FN-10.1.1.2_Feature_Flags_Konfigurieren.md) | Feature Flags Konfigurieren | draft |
| [FN-10.1.1.3](../functions/FN-10.1.1.3_SSO_Konfigurieren.md) | SSO Konfigurieren | draft |
| [FN-10.1.1.4](../functions/FN-10.1.1.4_API_Keys_Verwalten.md) | API Keys Verwalten | draft |


---

## Constraints

SAML 2.0 und OIDC. API-Key-Rotation. Feature-Flags pro Mandant. Nutzerlimits und Usage-Tracking.


---

## Infrastructure References

| INF-ID | Relevance |
|---|---|
| INF-2 | SSO-Sicherheit, Zertifikats-Validierung |
| INF-7 | Feature-Flags via Unleash/LaunchDarkly |
