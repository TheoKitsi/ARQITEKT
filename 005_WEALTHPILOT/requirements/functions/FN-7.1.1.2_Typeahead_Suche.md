---
type: function
id: FN-7.1.1.2
status: draft
parent: CMP-7.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-7.1.1.2: Typeahead Suche

> **Parent**: [CMP-7.1.1](../components/CMP-7.1.1_Produktkatalog_Suchmaschine.md)

---

## Functional Description

Das System muss bei Eingabe in das Suchfeld Vorschlaege anzeigen: Produktname und ISIN mit Highlighting des Suchbegriffs. Debounce: 200ms, max. 10 Vorschlaege.

- Das System soll Suche nach Produktname und ISIN unterstuetzen.
- Das System soll den Suchbegriff in den Vorschlaegen hervorheben (Bold).
- Das System soll die Vorschlaege per Tastatur navigierbar machen.

---

## Preconditions

- Produktkatalog ist indexiert.
- Suchfeld ist fokussiert.

---

## Behavior

1. Nutzer beginnt zu tippen (mindestens 2 Zeichen).
2. System wartet 200ms (Debounce) nach letzter Eingabe.
3. System sucht im Index nach Produktname und ISIN (Prefix-Match oder Fuzzy-Match).
4. System zeigt maximal 10 Vorschlaege als Dropdown-Liste.
5. System hebt den Suchbegriff in den Vorschlaegen hervor (z.B. "MSCI **World** ETF").
6. Nutzer kann per Pfeiltasten navigieren und per Enter auswaehlen.
7. Bei Auswahl: System navigiert zur Produkt-Detailansicht (FN-7.1.1.3).

---

## Postconditions

- Vorschlaege sind angezeigt (max. 10).
- Gewaehltes Produkt fuehrt zur Detailansicht.

---

## Error Handling

- Das System soll bei keinem Match die Meldung "Keine Vorschlaege" anzeigen.
- Das System soll bei API-Timeout den letzten bekannten Vorschlag beibehalten.
- Das System soll bei leerer Eingabe (< 2 Zeichen) den Dropdown schliessen.

---

## Acceptance Criteria (functional)

- [ ] Eingabe "MSCI" zeigt Vorschlaege mit "MSCI World", "MSCI Europe" etc.
- [ ] Eingabe "DE000ETF" zeigt ISIN-basierte Vorschlaege.
- [ ] Highlighting des Suchbegriffs ist sichtbar.
- [ ] Tastatur-Navigation (Pfeiltasten + Enter) funktioniert.
- [ ] Debounce verhindert Anfragen bei schnellem Tippen.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
