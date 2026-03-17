---
type: function
id: FN-2.2.1.1
status: draft
parent: CMP-2.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-2.2.1.1: Positionen Synchronisieren

> **Parent**: [CMP-2.2.1](../components/CMP-2.2.1_Depot_Sync_Engine.md)

---

## Functional Description

Das System muss taeglich alle Depot-Positionen (ISIN, Stueckzahl, Kurs, Waehrung) abrufen und mit dem lokalen Bestand abgleichen.

- Das System soll den Abgleich auf Basis der ISIN als eindeutigem Schluessel durchfuehren.
- Das System soll neue Positionen anlegen, geaenderte aktualisieren und aufgeloeste deaktivieren.
- Das System soll Kursdaten in EUR umrechnen (bei Fremdwaehrung ueber ECB-Wechselkurse).

---

## Preconditions

- Mindestens ein Depot ist erfasst (CMP-1.1.1).
- Depot-API-Zugang (finAPI oder CSV) ist konfiguriert.
- Tagesaktuelle Wechselkurse sind verfuegbar.

---

## Behavior

1. Cron-Job startet taeglich um 07:00 UTC.
2. System ruft alle Positionen pro Depot ueber die konfigurierte Quelle ab.
3. Pro Position: System prueft ob ISIN im lokalen Bestand existiert.
4. Neue ISIN: System legt Position an (ISIN, Stueckzahl, Kurs, Waehrung).
5. Bestehende ISIN: System aktualisiert Stueckzahl und Kurs.
6. ISIN nicht mehr in Quelle: System setzt Position auf Status "aufgeloest".
7. Fremdwaehrungspositionen: System rechnet in EUR um (ECB-Referenzkurs).
8. System speichert Sync-Timestamp und Ergebnis-Zusammenfassung.

---

## Postconditions

- Alle aktiven Depot-Positionen spiegeln den aktuellen Bestand wider.
- Aufgeloeste Positionen sind als "aufgeloest" markiert (nicht geloescht).
- Alle Kurse sind in EUR verfuegbar.

---

## Error Handling

- Das System soll bei API-Fehler den letzten bekannten Stand beibehalten und den Fehler loggen.
- Das System soll bei fehlenden ECB-Wechselkursen den Vortags-Kurs verwenden.
- Das System soll bei unbekannter ISIN die Position anlegen und als "Manuell pruefen" markieren.

---

## Acceptance Criteria (functional)

- [ ] Neue Position (ISIN DE000BASF111) wird korrekt angelegt.
- [ ] Stueckzahlaenderung (100 auf 150) wird aktualisiert.
- [ ] Aufgeloeste Position wird als "aufgeloest" markiert, nicht geloescht.
- [ ] USD-Position wird korrekt in EUR umgerechnet.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
