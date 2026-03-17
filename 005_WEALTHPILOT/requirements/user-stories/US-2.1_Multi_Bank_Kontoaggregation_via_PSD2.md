---
type: user-story
id: US-2.1
title: "Multi Bank Kontoaggregation via PSD2"
status: approved
parent: SOL-2
version: "1.0"
date: "2026-03-15"
---

# US-2.1: Multi Bank Kontoaggregation via PSD2

> **Parent**: [SOL-2](../solutions/SOL-2_Portfolio_Aggregation_und_Synchronisation.md)

---

## User Story

Als Nutzer moechte ich meine Bankkonten ueber PSD2 Open Banking automatisch verbinden, damit Kontostaaende und Transaktionen in Echtzeit synchronisiert werden.

---

## Acceptance Criteria

- [ ] AC-US-2.1.1: Nutzer kann aus einer Liste unterstuetzter Banken waehlen und Consent erteilen
- [ ] AC-US-2.1.2: Nach Consent-Erteilung werden Kontostaende innerhalb von 30 Sekunden synchronisiert
- [ ] AC-US-2.1.3: Transaktionshistorie der letzten 12 Monate wird importiert
- [ ] AC-US-2.1.4: Consent-Status wird angezeigt (aktiv, ablaufend, abgelaufen) mit Ablaufdatum
- [ ] AC-US-2.1.5: Bei Consent-Ablauf wird Nutzer 7 Tage vorher per Notification informiert

---

## Components

| CMP-ID | Title | Status |
| --- | --- | --- |
| [CMP-2.1.1](../components/CMP-2.1.1_PSD2_Kontoaggregations_Adapter.md) | PSD2 Kontoaggregations Adapter | draft |

---

## Wireframe Reference

<!-- TODO: Link to wireframe files when available. -->

---

## Notifications

| Trigger | NTF | Channels |
| --- | --- | --- |
| PSD2-Sync fehlgeschlagen | NTF-SYNC-FAILED | In-App, E-Mail |
| Bankverbindung getrennt | NTF-BANK-DISCONNECT | In-App, E-Mail |

