---
type: function
id: FN-7.1.1.1
status: draft
parent: CMP-7.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-7.1.1.1: Facettierte Suche

> **Parent**: [CMP-7.1.1](../components/CMP-7.1.1_Produktkatalog_Suchmaschine.md)

---

## Functional Description

Das System muss eine facettierte Suche ueber den Produktkatalog bieten: Filter nach Asset-Klasse, Risikoklasse (1-7), TER-Range, Rendite-Range, Fondsvolumen.

- Das System soll multiple Filter kombinierbar machen (AND-Verknuepfung).
- Das System soll die Ergebnis-Anzahl pro Facette anzeigen (Count-Badge).
- Das System soll die Ergebnisse sortierbar machen (nach Rendite, TER, Risikoklasse).

---

## Preconditions

- Produktkatalog ist befuellt und indexiert.
- Nutzer hat den Produktkatalog geoeffnet.

---

## Behavior

1. System zeigt Facetten-Sidebar: Asset-Klasse (Checkboxen), Risikoklasse (Range-Slider 1-7), TER (Range 0-3%), Rendite (Range), Fondsvolumen (Range).
2. Nutzer aktiviert einen oder mehrere Filter.
3. System filtert die Ergebnisse serverseitig (AND-Verknuepfung aller aktiven Filter).
4. System aktualisiert die Count-Badges pro Facette (verbleibende Treffer).
5. System zeigt die gefilterten Produkte als Tabelle/Karten-Liste.
6. Nutzer kann die Ergebnisse sortieren (Klick auf Spaltenheader).
7. System speichert die Filterkombination im URL-Query (Shareable).

---

## Postconditions

- Gefilterte Produktliste ist angezeigt.
- Count-Badges sind aktualisiert.
- Filter sind im URL-Query persistiert.

---

## Error Handling

- Das System soll bei 0 Ergebnissen die Meldung "Keine Produkte gefunden — bitte Filter anpassen" anzeigen.
- Das System soll bei Suchfehler die Meldung "Suche fehlgeschlagen" und einen Retry-Button anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Filter "Aktien" + "Risikoklasse 4-5" + "TER < 0.5%" liefert passende Ergebnisse.
- [ ] Count-Badge zeigt korrekte Trefferzahl pro Facette.
- [ ] Sortierung nach TER aufsteigend funktioniert.
- [ ] 0 Ergebnisse zeigen Hinweismeldung.
- [ ] Filter sind im URL-Query enthalten und bei Reload erhalten.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
