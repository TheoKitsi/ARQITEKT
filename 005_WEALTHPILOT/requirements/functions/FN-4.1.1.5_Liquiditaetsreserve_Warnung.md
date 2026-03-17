---
type: function
id: FN-4.1.1.5
status: draft
parent: CMP-4.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-4.1.1.5: Liquiditaetsreserve Warnung

> **Parent**: [CMP-4.1.1](../components/CMP-4.1.1_Umschichtungs_Konfigurator.md)

---

## Functional Description

Das System muss warnen wenn die geplante Umschichtung den empfohlenen Notgroschen (3 Nettomonatsgehaelter) unterschreitet.

- Das System soll die aktuelle Liquiditaetsreserve (Tagesgeld + Girokonto) berechnen.
- Das System soll die Rest-Liquiditaet nach Umschichtung berechnen.
- Das System soll bei Unterschreitung eine nicht-blockierende Warnung anzeigen.

---

## Preconditions

- Umschichtungskonfiguration ist vollstaendig.
- Monatliche Einnahmen (FN-1.2.1.1) sind erfasst.
- Liquide Konten (Tagesgeld, Girokonto) sind bekannt.

---

## Behavior

1. System berechnet den empfohlenen Notgroschen: 3 * monatliches Nettoeinkommen.
2. System berechnet die aktuelle Liquiditaetsreserve: Summe(Tagesgeld + Girokonto).
3. System berechnet die Rest-Liquiditaet nach Umschichtung: Liquiditaetsreserve - Umschichtungsbetrag_aus_liquiden_Mitteln.
4. Falls Rest-Liquiditaet < Notgroschen: System zeigt gelbe Warnung "Ihre Liquiditaetsreserve faellt unter den empfohlenen Notgroschen".
5. Warnung ist informativ (nicht blockierend) — Nutzer kann fortfahren.

---

## Postconditions

- Warnung ist angezeigt (oder nicht, wenn Reserve ausreicht).
- Nutzer hat die Information bevor die Berechnung gestartet wird.

---

## Error Handling

- Das System soll bei fehlenden Einnahmen-Daten die Warnung nicht anzeigen (kein Notgroschen berechenbar).
- Das System soll bei ausschliesslich Depot-Entnahmen (keine liquiden Mittel betroffen) keine Warnung anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Nettoeinkommen 3500 EUR, Notgroschen 10500 EUR, Liquiditaet 15000 EUR, Entnahme 8000 EUR: Rest 7000 EUR < 10500 EUR = Warnung.
- [ ] Rest-Liquiditaet > Notgroschen: Keine Warnung.
- [ ] Warnung blockiert den Fortschritt nicht.
- [ ] Fehlende Einnahmen-Daten: Keine Warnung, kein Fehler.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
