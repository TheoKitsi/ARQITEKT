---
type: function
id: FN-4.2.1.3
status: draft
parent: CMP-4.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.2.1.3: Steuerliche Auswirkung Berechnen

> **Parent**: [CMP-4.2.1](../components/CMP-4.2.1_Cross_Impact_Engine.md)

---

## Functional Description

Das System muss berechnen welche Steuerlast durch die Realisierung von Kursgewinnen bei der Umschichtung entsteht (Abgeltungssteuer + Soli + ggf. KiSt).

- Das System soll den unrealisierten Gewinn pro Position berechnen (Marktwert - Einstandskurs * Stueckzahl).
- Das System soll den Sparerpauschbetrag beruecksichtigen (bereits verbrauchter Anteil).
- Das System soll die Steuerlast als Abzug in der Impact-Berechnung einfliessen lassen.

---

## Preconditions

- Einstandskurse der Quell-Positionen sind berechnet (FN-2.2.1.2).
- Steuerprofil des Nutzers ist konfiguriert.
- Umschichtungsbetraege sind definiert.

---

## Behavior

1. Pro Quell-Position: System berechnet den anteiligen realisierten Gewinn basierend auf FIFO.
2. System berechnet den steuerpflichtigen Gewinn: Realisierter Gewinn - verbleibender Sparerpauschbetrag.
3. System berechnet Abgeltungssteuer: 25% auf steuerpflichtigen Gewinn.
4. System berechnet Solidaritaetszuschlag: 5.5% auf Abgeltungssteuer.
5. Optional: System berechnet Kirchensteuer (8% oder 9% auf Abgeltungssteuer).
6. System berechnet Gesamtsteuerlast und den Netto-Umschichtungsbetrag.
7. System speichert die Steuerlast als Impact-Faktor (FN-4.2.1.4).

---

## Postconditions

- Steuerlast ist berechnet und aufgeschluesselt.
- Netto-Umschichtungsbetrag (nach Steuer) ist ermittelt.
- Steuerlast fliesst in den Impact-Score ein.

---

## Error Handling

- Das System soll bei fehlendem Einstandskurs eine Warnung anzeigen und mit Marktwert als Einstandskurs rechnen (Worst-Case: voller Gewinn steuerpflichtig).
- Das System soll bei negativem realisierten Gewinn (Verlust) die Steuerlast auf 0 setzen.

---

## Acceptance Criteria (functional)

- [ ] Position mit 5000 EUR Gewinn, 1000 EUR Sparerpauschbetrag: Steuer = (5000-1000) * 0.26375 = 1055 EUR.
- [ ] Verlust-Position: Steuerlast = 0 EUR.
- [ ] Netto-Umschichtungsbetrag = Brutto - Steuerlast.
- [ ] Kirchensteuer wird optional korrekt berechnet.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
