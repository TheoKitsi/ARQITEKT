---
type: function
id: FN-3.2.1.3
status: draft
parent: CMP-3.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.2.1.3: Netto Rendite Berechnung

> **Parent**: [CMP-3.2.1](../components/CMP-3.2.1_Portfolio_Aggregator.md)

---

## Functional Description

Das System muss die Netto-Rendite nach Steuern berechnen: Abgeltungssteuer 25% + Soli 5,5% = 26,375% auf realisierte Gewinne, Sparerpauschbetrag 1000 EUR beruecksichtigt.

- Das System soll nur auf realisierte Gewinne (Verkaeufe, Dividenden) Steuern anwenden.
- Das System soll den Sparerpauschbetrag (1000 EUR Einzelperson / 2000 EUR Ehepaare) abziehen.
- Das System soll Kirchensteuer optional beruecksichtigen (8% oder 9% je nach Bundesland).

---

## Preconditions

- Brutto-Rendite ist berechnet.
- Realisierte Gewinne und Dividenden sind bekannt.
- Steuerprofil des Nutzers (Sparerpauschbetrag, Kirchensteuer) ist konfiguriert.

---

## Behavior

1. System ermittelt die realisierten Gewinne im Betrachtungszeitraum.
2. System zieht den Sparerpauschbetrag ab (max. 1000 EUR oder 2000 EUR).
3. Bei positivem steuerpflichtigem Gewinn: System berechnet Abgeltungssteuer (25%).
4. System berechnet Solidaritaetszuschlag (5,5% auf die Abgeltungssteuer).
5. Optional: System berechnet Kirchensteuer (8% oder 9% auf die Abgeltungssteuer).
6. System berechnet Netto-Rendite: Brutto-Gewinn - Gesamtsteuer.
7. System zeigt Brutto und Netto nebeneinander an.

---

## Postconditions

- Netto-Rendite nach Steuern ist berechnet.
- Steuerdetails (Abgeltungssteuer, Soli, ggf. KiSt) sind aufgeschluesselt.
- Sparerpauschbetrag ist korrekt beruecksichtigt.

---

## Error Handling

- Das System soll bei fehlendem Steuerprofil die Standardwerte (1000 EUR, keine KiSt) verwenden.
- Das System soll bei negativem realisierten Gewinn keine Steuer berechnen (Verlust = 0% Steuer).
- Das System soll bei Verlustverrechnung den Verlustvortrag beruecksichtigen (falls implementiert).

---

## Acceptance Criteria (functional)

- [ ] Realisierter Gewinn 5000 EUR: Steuer = (5000-1000) * 0.26375 = 1055 EUR.
- [ ] Sparerpauschbetrag 2000 EUR bei Ehepaaren: Steuer = (5000-2000) * 0.26375 = 791.25 EUR.
- [ ] Negativer realisierter Gewinn: Steuer = 0 EUR.
- [ ] Kirchensteuer 9% ergibt: 4000 * 0.25 * 0.09 = 90 EUR zusaetzlich.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
