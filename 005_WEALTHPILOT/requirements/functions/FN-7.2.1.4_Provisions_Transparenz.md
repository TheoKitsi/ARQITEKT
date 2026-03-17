---
type: function
id: FN-7.2.1.4
status: draft
parent: CMP-7.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-7.2.1.4: Provisions Transparenz

> **Parent**: [CMP-7.2.1](../components/CMP-7.2.1_Produkt_Matching_Engine.md)

---

## Functional Description

Das System muss Produkte mit Bestandsprovision oder Ausgabeaufschlag explizit kennzeichnen (MiFID-II Transparenzpflicht).

- Das System soll Provisions-Informationen als Badge auf der Produktkarte anzeigen.
- Das System soll den Ausgabeaufschlag in EUR und % anzeigen.
- Das System soll einen Vergleich mit provisionsfreien Alternativen anbieten.

---

## Preconditions

- Produkt-Daten inkl. Provisions-Informationen sind verfuegbar.

---

## Behavior

1. System prueft pro Produkt: Hat Bestandsprovision ja/nein, Ausgabeaufschlag ja/nein.
2. Bei Bestandsprovision: System zeigt gelbes Badge "Bestandsprovision".
3. Bei Ausgabeaufschlag: System zeigt den Aufschlag prominent: "Ausgabeaufschlag: 5% (250 EUR bei 5000 EUR)".
4. System zeigt einen Link "Provisionsfreie Alternativen anzeigen".
5. Bei Klick: System filtert den Katalog nach Produkten ohne Provision/Aufschlag.

---

## Postconditions

- Provisions-Informationen sind transparent angezeigt.
- Provisionsfreie Alternativen sind verlinkt.

---

## Error Handling

- Das System soll bei fehlenden Provisions-Daten keinen Badge anzeigen (keine falsche Aussage).
- Das System soll bei Produkt ohne Provision keinen Badge anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Produkt mit Bestandsprovision zeigt gelbes Badge.
- [ ] Ausgabeaufschlag 5% bei 5000 EUR zeigt "250 EUR".
- [ ] Provisionsfreies Produkt: Kein Badge.
- [ ] Link "Alternativen" filtert korrekt.
- [ ] Fehlende Provisions-Daten: Kein Badge, kein Fehler.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
