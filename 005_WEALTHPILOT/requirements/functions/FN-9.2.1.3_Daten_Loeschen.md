---
type: function
id: FN-9.2.1.3
status: draft
parent: CMP-9.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-9.2.1.3: Daten Loeschen

> **Parent**: [CMP-9.2.1](../components/CMP-9.2.1_DSGVO_Loeschmodul.md)

---

## Functional Description

Das System muss nicht-regulatorische Daten innerhalb von 30 Tagen nach Antrag unwiderruflich loeschen. Regulatorische Daten werden pseudonymisiert und nach Ablauf der Frist geloescht.

- Das System soll die Loeschung als Background-Job ausfuehren.
- Das System soll die Pseudonymisierung per Daten-Maskierung durchfuehren.
- Das System soll die Loeschung als Audit-Event protokollieren.

---

## Preconditions

- Aufbewahrungspflichten-Pruefung (FN-9.2.1.2) ist abgeschlossen.
- Daten sind in "loeschbar" und "aufbewahrungspflichtig" klassifiziert.

---

## Behavior

1. System startet den Loeschprozess als Background-Job.
2. Sofort loeschbare Daten: System loescht unwiderruflich (DELETE + Ueberschreiben des Speicherplatzes).
3. Aufbewahrungspflichtige Daten: System pseudonymisiert — Name, E-Mail, IBAN werden durch Platzhalter ersetzt.
4. System setzt den loeschbaren Referenzen auf NULL (Kaskaden-Nulling).
5. System protokolliert die Loeschung als Audit-Event: Anzahl geloeschter Datensaetze, Pseudonymisierte Datensaetze, Zeitstempel.
6. System setzt den Loeschantrag-Status auf "ausgefuehrt".
7. System plant die endgueltige Loeschung der pseudonymisierten Daten nach Ablauf der Aufbewahrungsfrist.

---

## Postconditions

- Nicht-regulatorische Daten sind unwiderruflich geloescht.
- Regulatorische Daten sind pseudonymisiert.
- Audit-Event ist protokolliert.
- Loeschantrag-Status ist "ausgefuehrt".

---

## Error Handling

- Das System soll bei Loeschfehler den Vorgang abbrechen, den Fehler loggen und einen manuellen Review-Prozess ausloesen.
- Das System soll bei Pseudonymisierungsfehler den Datensatz als "Manuell pruefen" markieren.
- Das System soll NIEMALS regulatorische Daten ohne Pseudonymisierung loeschen.

---

## Acceptance Criteria (functional)

- [ ] Profildaten (Name, Adresse) sind unwiderruflich geloescht.
- [ ] Beratungsprotokoll ist pseudonymisiert (Name = "GELOESCHT", E-Mail = "deleted@void.invalid").
- [ ] Audit-Event bestaetigt die Loeschung.
- [ ] Regulatorische Daten werden nie vor Fristablauf geloescht.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
