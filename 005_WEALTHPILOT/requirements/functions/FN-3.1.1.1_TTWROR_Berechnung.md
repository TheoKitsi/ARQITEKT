---
type: function
id: FN-3.1.1.1
status: draft
parent: CMP-3.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.1.1.1: TTWROR Berechnung

> **Parent**: [CMP-3.1.1](../components/CMP-3.1.1_Rendite_Rechner.md)

---

## Functional Description

Das System muss die True Time-Weighted Rate of Return fuer jede Position berechnen. Cash-Flows (Einzahlungen, Entnahmen) werden neutralisiert, sodass nur die Investmentleistung gemessen wird.

- Das System soll die TTWROR gemaess Global Investment Performance Standards (GIPS) berechnen.
- Das System soll Sub-Perioden an jedem Cash-Flow-Zeitpunkt bilden.
- Das System soll die TTWROR fuer beliebige Zeitraeume (1M, 3M, 6M, 1J, 3J, YTD, Gesamt) berechnen.

---

## Preconditions

- Mindestens eine Position mit Kursdaten existiert.
- Transaktionshistorie (Kaeufe, Verkaeufe, Dividenden) ist verfuegbar.

---

## Behavior

1. System laedt die Kurszeitreihe und alle Cash-Flows der Position.
2. System bildet Sub-Perioden: Jeder Cash-Flow erzeugt eine neue Sub-Periode.
3. Pro Sub-Periode: System berechnet die Halteperioden-Rendite (HPR = Endwert / Anfangswert - 1).
4. System verkettet alle HPRs multiplikativ: TTWROR = (1+HPR1) * (1+HPR2) * ... - 1.
5. System annualisiert das Ergebnis bei Zeitraeumen > 1 Jahr: TTWROR_ann = (1+TTWROR)^(365/Tage) - 1.
6. System rundet auf 2 Dezimalstellen und speichert das Ergebnis.

---

## Postconditions

- TTWROR ist fuer die Position in allen konfigurierten Zeitraeumen berechnet.
- Das Ergebnis ist im Rendite-Cache (FN-3.1.1.4) gespeichert.
- Die Berechnung ist GIPS-konform.

---

## Error Handling

- Das System soll bei fehlendem Kursdatum eine lineare Interpolation durchfuehren.
- Das System soll bei Division durch Null (Anfangswert = 0) die Sub-Periode ueberspringen.
- Das System soll bei weniger als 2 Datenpunkten "n/a" zurueckgeben.

---

## Acceptance Criteria (functional)

- [ ] Position mit 3 Sub-Perioden (+5%, -2%, +8%) ergibt TTWROR = 11.16%.
- [ ] Cash-Flows beeinflussen die TTWROR nicht (nur die Investmentleistung).
- [ ] Annualisierung bei 730 Tagen und 20% Gesamt ergibt ca. 9.54% p.a.
- [ ] Weniger als 2 Datenpunkte ergeben "n/a".

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
