---
type: function
id: FN-9.2.1.2
status: draft
parent: CMP-9.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-9.2.1.2: Aufbewahrungspflichten Pruefen

> **Parent**: [CMP-9.2.1](../components/CMP-9.2.1_DSGVO_Loeschmodul.md)

---

## Functional Description

Das System muss automatisch pruefen welche Daten regulatorischen Aufbewahrungspflichten unterliegen: WpHG 5J (Beratungsprotokolle), HGB 10J (Geschaeftsvorfaelle).

- Das System soll die Pruefung regelbasiert durchfuehren.
- Das System soll die Daten in "sofort loeschbar" und "aufbewahrungspflichtig" klassifizieren.
- Das System soll die Restlaufzeit der Aufbewahrungspflicht berechnen.

---

## Preconditions

- Loeschantrag ist erfasst (FN-9.2.1.1).
- Aufbewahrungsregeln sind konfiguriert.

---

## Behavior

1. System laedt alle Daten des Nutzers.
2. Pro Datensatz: System prueft gegen die Aufbewahrungsregeln: WpHG (Beratungsprotokolle, 5 Jahre), HGB (Geschaeftsvorfaelle, 10 Jahre), Audit-Logs (10 Jahre).
3. System klassifiziert: "sofort loeschbar" (keine Pflicht oder Pflicht abgelaufen) vs. "aufbewahrungspflichtig" (Pflicht noch aktiv).
4. Bei aufbewahrungspflichtigen Daten: System berechnet die Restlaufzeit.
5. System erstellt eine Zusammenfassung: Anzahl loeschbarer Datensaetze, Anzahl aufbewahrungspflichtiger Datensaetze mit jeweiliger Frist.
6. System leitet die Zusammenfassung an die Loeschung (FN-9.2.1.3) weiter.

---

## Postconditions

- Alle Daten sind klassifiziert.
- Zusammenfassung ist erstellt.
- Loeschprozess kann starten.

---

## Error Handling

- Das System soll bei unbekanntem Datentyp den Datensatz als "aufbewahrungspflichtig" klassifizieren (Safety-First).
- Das System soll bei Regelkonfigurationsfehler den gesamten Loeschprozess pausieren und einen Admin-Alert ausloesen.

---

## Acceptance Criteria (functional)

- [ ] Beratungsprotokoll von 2022: Aufbewahrungspflicht WpHG bis 2027 (noch aktiv).
- [ ] Profildaten ohne regulatorische Pflicht: Sofort loeschbar.
- [ ] Audit-Logs von 2024: Aufbewahrungspflicht HGB bis 2034.
- [ ] Unbekannter Datentyp: Wird als aufbewahrungspflichtig klassifiziert.
- [ ] Zusammenfassung zeigt korrekte Anzahlen und Fristen.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
