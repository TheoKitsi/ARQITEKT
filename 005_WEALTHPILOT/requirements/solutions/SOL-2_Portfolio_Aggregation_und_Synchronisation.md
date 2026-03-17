---
type: solution
id: SOL-2
title: "Portfolio-Aggregation & Synchronisation"
status: approved
parent: BC-1
version: "1.0"
date: "2026-03-15"
dependencies:
  upstream: ["SOL-1"]
  downstream: ["SOL-3", "SOL-8"]
---

# SOL-2: Portfolio-Aggregation & Synchronisation

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Dependencies**: upstream: SOL-1 | downstream: SOL-3, SOL-8





---

## System Boundaries

### In Scope

- PSD2-basierte Kontoaggregation ueber finAPI (AISP).
- Automatische Depot-Synchronisation (Positionen, Transaktionen, Marktwerte).
- Kursimport und Depotbewertung.
- Corporate-Action-Handling (Splits, Kapitalerhoehungen).

### Out of Scope

- Zahlungsausloesung (PISP) — kein Payment-Initiation.
- Manuelle Konto-Erfassung (siehe SOL-1).
- Renditeberechnung (siehe SOL-3).

---

## User Story Index

| US-ID | Title | Status |
| --- | --- | --- |
| [US-2.1](../user-stories/US-2.1_Multi_Bank_Kontoaggregation_via_PSD2.md) | Multi Bank Kontoaggregation via PSD2 | draft |
| [US-2.2](../user-stories/US-2.2_Depot_Positionen_und_Rendite_synchronisieren.md) | Depot Positionen und Rendite synchronisieren | draft |

---

## Architecture Context

Frontend: Banking-Connection-Wizard | Backend: NestJS + finAPI-SDK (AISP) | Sync: Cron-basierter Sync-Job (alle 4h) | DB: PostgreSQL (transactions, positions, prices)

---

## Edge Cases (SOL-2)

| # | Szenario | Regel |
|---|---|---|
| EC-2.1 | **PSD2-Consent läuft ab (90-Tage-Regel)** | System benachrichtigt Nutzer 7 Tage vor Ablauf. Bei Ablauf: Letzte bekannte Werte behalten, als "veraltet" markieren, Sync deaktivieren bis Re-Consent. |
| EC-2.2 | **Bank-API temporär nicht erreichbar** | Retry mit exponential backoff (3x über 15 Min). Bei Dauerfehler: Nutzer informieren, letzte Werte behalten. |
| EC-2.3 | **Kryptowährungen im Portfolio** | Crypto-Wallets über spezialisierte APIs (CoinGecko, CryptoCompare). Volatilitäts-Warnung bei >10% Crypto-Anteil. |
| EC-2.4 | **Mehrere Depots bei derselben Bank** | System erkennt automatisch getrennte Depots und listet sie separat. Zusammenfassung per Bank als gruppierte Ansicht. |
