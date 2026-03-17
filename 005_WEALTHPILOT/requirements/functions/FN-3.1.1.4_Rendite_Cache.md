---
type: function
id: FN-3.1.1.4
status: draft
parent: CMP-3.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.1.1.4: Rendite Cache

> **Parent**: [CMP-3.1.1](../components/CMP-3.1.1_Rendite_Rechner.md)

---

## Functional Description

Das System muss berechnete Renditen cachen und nur bei neuen Transaktionen inkrementell aktualisieren. Cache-Invalidierung erfolgt gezielt pro Position.

- Das System soll Redis als Cache-Backend verwenden.
- Das System soll Cache-Keys nach dem Schema user:{id}:position:{isin}:rendite:{zeitraum} strukturieren.
- Das System soll TTL auf 24 Stunden setzen als Sicherheitsnetz.

---

## Preconditions

- Redis-Instanz ist verfuegbar und erreichbar.
- Renditeberechnung (TTWROR/MWR) ist implementiert.

---

## Behavior

1. Bei Rendite-Abfrage: System prueft zunaechst den Redis-Cache.
2. Cache-Hit: System liefert den gecachten Wert sofort zurueck.
3. Cache-Miss: System berechnet die Rendite, speichert das Ergebnis im Cache und liefert zurueck.
4. Bei neuer Transaktion/Kursupdate: System invalidiert den Cache-Key fuer die betroffene Position.
5. Bei Kapitalmassnahme (FN-2.2.1.3): System invalidiert den Cache fuer die betroffene Position.
6. TTL von 24 Stunden als automatische Reinvalidierung.

---

## Postconditions

- Berechnete Renditen sind im Cache gespeichert.
- Cache ist bei Datenänderungen invalidiert.
- Veraltete Eintraege verfallen nach 24 Stunden automatisch.

---

## Error Handling

- Das System soll bei Redis-Ausfall direkt berechnen (Bypass-Cache) und das Ergebnis ohne Cache zurueckgeben.
- Das System soll bei Cache-Korruption den betroffenen Key loeschen und neu berechnen.
- Das System soll Redis-Verbindungsfehler loggen aber keine Nutzerfehler anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Zweite Abfrage der gleichen Rendite wird aus dem Cache bedient (Antwortzeit < 10ms).
- [ ] Neue Transaktion invalidiert den Cache fuer die betroffene Position.
- [ ] Cache-Eintrag verfaellt nach 24 Stunden.
- [ ] Redis-Ausfall fuehrt zu korrekter Berechnung (nur langsamer).

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
