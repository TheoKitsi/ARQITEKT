---
type: function
id: FN-7.1.1.4
status: draft
parent: CMP-7.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-7.1.1.4: Mandantenfilter

> **Parent**: [CMP-7.1.1](../components/CMP-7.1.1_Produktkatalog_Suchmaschine.md)

---

## Functional Description

Das System muss sicherstellen, dass nur Produkte angezeigt werden, die fuer den aktuellen Mandanten freigeschaltet sind.

- Das System soll die Produktfreigabe mandantenspezifisch verwalten.
- Das System soll den Mandantenfilter transparent anwenden (kein UI-Element noetig).
- Das System soll bei jedem API-Call den Mandantenkontext als Filter mitgeben.

---

## Preconditions

- Nutzer ist authentifiziert und einem Mandanten zugeordnet.
- Produktfreigabe-Liste ist fuer den Mandanten konfiguriert.

---

## Behavior

1. Bei jeder Produktsuche/Abfrage: System extrahiert die Mandanten-ID aus dem JWT-Token.
2. System fuegt den Mandantenfilter als WHERE-Klausel in die Datenbankabfrage ein.
3. Nur freigeschaltete Produkte (mandant_products.mandant_id = aktuelle_ID) werden zurueckgegeben.
4. Der Filter ist fuer den Nutzer unsichtbar (keine zusaetzliche UI-Interaktion).
5. Admin kann die Produktfreigabe pro Mandant im Verwaltungsmodul pflegen.

---

## Postconditions

- Nur mandantenspezifisch freigeschaltete Produkte sind sichtbar.
- Kein Produkt eines anderen Mandanten wird angezeigt.

---

## Error Handling

- Das System soll bei fehlender Mandanten-Zuordnung im Token die Anfrage mit 403 abweisen.
- Das System soll bei leerer Freigabeliste (0 Produkte) die Meldung "Keine Produkte fuer Ihren Bereich freigeschaltet" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Mandant A sieht nur seine freigeschalteten Produkte.
- [ ] Mandant B sieht nur seine freigeschalteten Produkte.
- [ ] Produkt nicht freigeschaltet fuer Mandant A: Nicht in Suchergebnissen.
- [ ] Fehlende Mandanten-ID: 403 Forbidden.
- [ ] Leere Freigabeliste: Hinweismeldung.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
