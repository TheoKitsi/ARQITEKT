---
type: function
id: FN-6.3.1.1
status: draft
parent: CMP-6.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.3.1.1: Mietkosten Projizieren

> **Parent**: [CMP-6.3.1](../components/CMP-6.3.1_Miet_Kauf_Vergleichsmodul.md)

---

## Functional Description

Das System muss die Mietkosten ueber den gewaehlten Zeitraum projizieren: Kaltmiete * (1 + Steigerung)^n. Steigerung konfigurierbar (Standard: 2% p.a.).

- Das System soll die Mietsteigerung konfigurierbar machen.
- Das System soll die kumulierten Mietkosten berechnen.
- Das System soll die Projektion als Linien-Chart anzeigen.

---

## Preconditions

- Aktuelle Kaltmiete ist eingegeben.
- Projektionszeitraum ist gewaehlt (Standard: 30 Jahre).

---

## Behavior

1. Nutzer gibt die aktuelle monatliche Kaltmiete ein.
2. Nutzer waehlt die jaehrliche Mietsteigerung (Standard: 2%, Slider 0-5%).
3. Nutzer waehlt den Projektionszeitraum (10-40 Jahre).
4. System berechnet pro Jahr: Miete_n = Kaltmiete * 12 * (1 + Steigerung)^n.
5. System berechnet die kumulierten Mietkosten ueber den gesamten Zeitraum.
6. System zeigt die Projektion als Linien-Chart (Jahresmiete + kumulierte Kosten).

---

## Postconditions

- Mietkosten-Projektion ist berechnet.
- Kumulierte Kosten sind verfuegbar fuer den Vergleich (FN-6.3.1.3).
- Linien-Chart ist gerendert.

---

## Error Handling

- Das System soll bei Kaltmiete = 0 die Meldung "Bitte Kaltmiete eingeben" anzeigen.
- Das System soll bei Steigerung > 5% eine Warnung "Unrealistisch hohe Steigerungsrate" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Kaltmiete 1000 EUR, 2% Steigerung, 30 Jahre: Kumulierte Kosten ca. 486.000 EUR.
- [ ] Aenderung der Steigerungsrate berechnet sofort neu.
- [ ] Linien-Chart zeigt den Kostenanstieg visuell.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
