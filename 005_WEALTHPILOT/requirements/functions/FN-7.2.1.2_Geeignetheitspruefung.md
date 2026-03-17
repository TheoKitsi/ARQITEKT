---
type: function
id: FN-7.2.1.2
status: draft
parent: CMP-7.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-7.2.1.2: Geeignetheitspruefung

> **Parent**: [CMP-7.2.1](../components/CMP-7.2.1_Produkt_Matching_Engine.md)

---

## Functional Description

Das System muss vor jeder Empfehlung eine MiFID-II-konforme Geeignetheitspruefung durchfuehren: Risikoklasse des Produkts <= Risikoklasse des Nutzers.

- Das System soll die Geeignetheitspruefung automatisch bei jeder Empfehlung ausfuehren.
- Das System soll ungeeignete Produkte aus der Empfehlungsliste ausschliessen.
- Das System soll die Pruefung als Audit-Event protokollieren.

---

## Preconditions

- Nutzer-Risikoklasse ist zugeordnet (FN-1.3.1.2).
- Produkt-Risikoklassse ist bekannt.

---

## Behavior

1. Pro Produkt: System prueft ob Produkt-Risikoklasse <= Nutzer-Risikoklasse.
2. Geeignet: Produkt bleibt in der Empfehlungsliste.
3. Nicht geeignet: Produkt wird aus der Empfehlungsliste entfernt.
4. System protokolliert die Pruefung als Audit-Event: Produkt-ID, Nutzer-ID, Ergebnis (geeignet/nicht geeignet), Zeitstempel.
5. System zeigt optional einen Vermerk "X Produkte wegen Risikoprofil ausgeschlossen".

---

## Postconditions

- Nur geeignete Produkte sind in der Empfehlungsliste.
- Geeignetheitspruefung ist im Audit-Log protokolliert.
- Ausschluss-Vermerk ist sichtbar.

---

## Error Handling

- Das System soll bei fehlender Nutzer-Risikoklasse keine Empfehlungen anzeigen und "Bitte Risikoprofil ausfuellen" melden.
- Das System soll bei fehlender Produkt-Risikoklasse das Produkt vorsichtshalber ausschliessen.

---

## Acceptance Criteria (functional)

- [ ] Nutzer Risikoklasse 3, Produkt Risikoklasse 5: Produkt wird ausgeschlossen.
- [ ] Nutzer Risikoklasse 5, Produkt Risikoklasse 3: Produkt bleibt.
- [ ] Audit-Log enthaelt alle Pruefungsergebnisse.
- [ ] Fehlende Nutzer-RK: Keine Empfehlungen, Hinweismeldung.
- [ ] Ausschluss-Vermerk zeigt korrekte Anzahl ausgeschlossener Produkte.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
