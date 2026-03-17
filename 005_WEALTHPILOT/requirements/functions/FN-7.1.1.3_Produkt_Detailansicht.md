---
type: function
id: FN-7.1.1.3
status: draft
parent: CMP-7.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-7.1.1.3: Produkt Detailansicht

> **Parent**: [CMP-7.1.1](../components/CMP-7.1.1_Produktkatalog_Suchmaschine.md)

---

## Functional Description

Das System muss fuer jedes Produkt ein Factsheet anzeigen: Name, ISIN, WKN, Emittent, TER, Rendite 1/3/5J, Risikoklasse, Fondsprofil, ESG-Rating.

- Das System soll alle verfuegbaren Produktdaten strukturiert anzeigen.
- Das System soll die Rendite als Chart (1/3/5J Balkendiagramm) visualisieren.
- Das System soll einen "Zum Vergleich hinzufuegen"-Button bieten.

---

## Preconditions

- Nutzer hat ein Produkt ausgewaehlt.
- Produktdaten sind im Katalog verfuegbar.

---

## Behavior

1. System laedt die vollstaendigen Produktdaten (Name, ISIN, WKN, Emittent, TER, Renditen, Risikoklasse, ESG-Rating).
2. System zeigt die Stammdaten als strukturierte Karte.
3. System rendert Rendite-Balkendiagramm (1J, 3J, 5J).
4. System zeigt die Risikoklasse als nummerische Skala (1-7) mit Hervorhebung.
5. System zeigt den ESG-Rating-Badge (falls verfuegbar).
6. System bietet Buttons: "Zum Vergleich hinzufuegen" und "Empfehlung anfordern".

---

## Postconditions

- Produkt-Detailansicht ist vollstaendig gerendert.
- Alle verfuegbaren Datenpunkte sind angezeigt.

---

## Error Handling

- Das System soll bei fehlenden Einzeldaten (z.B. kein 5J-Rendite) das Feld als "n/a" anzeigen.
- Das System soll bei Ladefehler eine Fehlermeldung "Produkt konnte nicht geladen werden" anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Factsheet zeigt Name, ISIN, WKN, Emittent, TER korrekt.
- [ ] Rendite-Chart zeigt 1J, 3J, 5J als Balken.
- [ ] ESG-Rating wird als Badge angezeigt (falls vorhanden).
- [ ] Fehlende 5J-Rendite zeigt "n/a".
- [ ] "Zum Vergleich"-Button fuegt Produkt zur Vergleichsliste hinzu.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
