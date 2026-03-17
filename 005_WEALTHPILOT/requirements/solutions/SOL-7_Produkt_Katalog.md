---
type: solution
id: SOL-7
title: "Produkt-Katalog (B2B)"
status: approved
parent: BC-1
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: ["SOL-1", "SOL-3"]
  downstream: ["SOL-8"]
---

# SOL-7: Produkt-Katalog (B2B)

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: SOL-1, SOL-3 | downstream: SOL-8





---

## System Boundaries

### In Scope

- Facettierte Produktsuche mit Filter und Typeahead.
- Mandantenspezifische Produktfreigabe.
- Matching-Score-Berechnung basierend auf Nutzerprofil.
- MiFID-II-konforme Geeignetheitspruefung.
- Provisionstransparenz.

### Out of Scope

- Produktkauf / Order-Ausfuehrung.
- Eigener Produktdatenpflege-Prozess (Import aus Drittanbietern).
- Individuelle Anlageberatung (nur regelbasierte Empfehlung).

---

## User Story Index

| US-ID | Title | Status |
| --- | --- | --- |
| [US-7.1](../user-stories/US-7.1_Produktkatalog_durchsuchen.md) | Produktkatalog durchsuchen | draft |
| [US-7.2](../user-stories/US-7.2_Passende_Produkte_empfehlen.md) | Passende Produkte empfehlen | draft |

---

## Architecture Context

Frontend: Facettierte Suche + Detailansicht | Backend: NestJS Produktkatalog-API | DB: PostgreSQL + pg_trgm (Fuzzy-Suche) | Matching: Score-Service (konfigurierbare Gewichte)

---

## Edge Cases (SOL-7)

| # | Szenario | Regel |
|---|---|---|
| EC-7.1 | **Mandant hat kein Produktportfolio hinterlegt** | System arbeitet im "neutralen Modus" — zeigt generische Asset-Klassen statt spezifischer Produkte. Hinweis an Mandanten-Admin. |
| EC-7.2 | **Interessenkonflikt: Provision vs. Kundeninteresse** | Bei provisionsabhängigen Produkten: Pflicht-Kennzeichnung "Provisionsbasiert". MiFID-II-konforme Transparenz. Unabhängige Bewertung immer zusätzlich anzeigen. |
| EC-7.3 | **Produkt wird während Beratung eingestellt** | Echtzeit-Prüfung: Bei Produktänderung → Warnung im Beratungsgespräch. Alternatives Produkt automatisch vorschlagen. |
| EC-7.4 | **Regulatorische Einschränkung (Risikoklasse vs. Kundenprofil)** | Produkte die die Risikoklasse des Kunden überschreiten: Nicht empfehlen, aber auf Nachfrage zeigen mit Pflicht-Warnung. |
