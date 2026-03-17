---
type: function
id: FN-3.3.1.1
status: draft
parent: CMP-3.3.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-3.3.1.1: Benchmark Daten Laden

> **Parent**: [CMP-3.3.1](../components/CMP-3.3.1_Benchmark_Vergleichsmodul.md)

---

## Functional Description

Das System muss taeglich Schlusskurse fuer DAX, MSCI World, MSCI Europe, S&P 500 und HVPI-Inflation von einem externen Datenanbieter laden.

- Das System soll einen taeglichen Cron-Job (20:00 UTC, nach Boersenschluss) ausfuehren.
- Das System soll die Daten ueber eine REST-API des Datenanbieters abrufen.
- Das System soll historische Daten fuer mindestens 10 Jahre vorhalten.

---

## Preconditions

- Datenanbieter-API ist konfiguriert (API-Key, Endpoint).
- Netzwerkverbindung zum Datenanbieter besteht.

---

## Behavior

1. Cron-Job startet taeglich um 20:00 UTC.
2. System ruft Schlusskurse fuer die 5 konfigurierten Benchmark-Indizes ab.
3. System validiert die empfangenen Daten (Datum, Kurs > 0, keine Duplikate).
4. System speichert die Schlusskurse in der Zeitreihen-Tabelle.
5. System aktualisiert den lastSync-Timestamp fuer Benchmark-Daten.
6. An Wochenenden/Feiertagen: System ueberspringt den Abruf (kein Boersentag).

---

## Postconditions

- Aktuelle Schlusskurse aller 5 Indizes sind gespeichert.
- Zeitreihendaten sind lueckenlos fuer die letzten 10 Jahre.
- Duplikate werden vermieden.

---

## Error Handling

- Das System soll bei API-Fehler den letzten bekannten Kurs beibehalten und den Abruf in 2 Stunden wiederholen.
- Das System soll bei unvollstaendigen Daten (nur 3 von 5 Indizes) die vorhandenen speichern und die fehlenden loggen.
- Das System soll bei Kurs = 0 oder negativem Kurs den Datensatz verwerfen und warnen.

---

## Acceptance Criteria (functional)

- [ ] DAX-Schlusskurs wird taeglich um 20:00 UTC abgerufen und gespeichert.
- [ ] Samstag/Sonntag wird uebersprungen.
- [ ] API-Fehler fuehrt zu Retry in 2 Stunden.
- [ ] Historische Daten reichen mindestens 10 Jahre zurueck.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
