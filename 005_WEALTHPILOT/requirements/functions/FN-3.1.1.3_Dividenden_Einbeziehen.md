---
type: function
id: FN-3.1.1.3
status: draft
parent: CMP-3.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.1.1.3: Dividenden Einbeziehen

> **Parent**: [CMP-3.1.1](../components/CMP-3.1.1_Rendite_Rechner.md)

---

## Functional Description

Das System muss Dividenden und Ausschuettungen in die Renditeberechnung einbeziehen (Total Return statt Price Return).

- Das System soll Dividenden als Cash-Flow-Ereignis in der Renditeberechnung beruecksichtigen.
- Das System soll zwischen Brutto- und Netto-Dividende (nach Quellensteuer) unterscheiden.
- Das System soll bei thesaurierenden Fonds die Wiederanlage automatisch beruecksichtigen.

---

## Preconditions

- Dividenden-/Ausschuettungsdaten sind verfuegbar (via Sync oder manuell).
- Renditeberechnung (TTWROR/MWR) ist implementiert.

---

## Behavior

1. System identifiziert alle Dividenden-Events fuer eine Position.
2. System klassifiziert: ausschuettend (Cash-Dividende) vs. thesaurierend (Wiederanlage).
3. Bei ausschuettender Dividende: System fuegt die Netto-Dividende als Cash-Flow hinzu.
4. Bei thesaurierendem Fonds: System passt den NAV automatisch an (keine separate Cash-Flow-Buchung).
5. System berechnet Total Return = Price Return + Dividend Return.
6. System zeigt Price Return und Total Return separat an.

---

## Postconditions

- Total Return beruecksichtigt alle Dividenden und Ausschuettungen.
- Price Return und Total Return sind separat verfuegbar.
- Thesaurierende Fonds werden korrekt behandelt.

---

## Error Handling

- Das System soll bei fehlenden Dividendendaten den Price Return als Fallback verwenden.
- Das System soll bei doppelter Dividendenbuchung das Duplikat erkennen und ueberspringen.

---

## Acceptance Criteria (functional)

- [ ] Position mit 5% Kursgewinn und 2% Dividendenrendite zeigt Total Return von ca. 7%.
- [ ] Thesaurierender Fonds zeigt keinen separaten Dividenden-Cash-Flow.
- [ ] Brutto- und Netto-Dividende werden korrekt unterschieden.
- [ ] Price Return und Total Return sind separat sichtbar.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
