---
type: function
id: FN-1.1.1.3
status: draft
parent: CMP-1.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-1.1.1.3: Vermoegen Kategorisieren

> **Parent**: [CMP-1.1.1](../components/CMP-1.1.1_Konto_und_Depot_Erfassungsformular.md)

---

## Functional Description

Das System muss jedes erfasste Konto/Depot einer Asset-Klasse zuordnen: Tagesgeld, Festgeld, Aktien, Anleihen, Fonds, ETFs, Immobilien, Krypto, Sonstige.

- Das System soll eine automatische Vorschlagszuordnung basierend auf dem Kontotyp vornehmen.
- Das System soll dem Nutzer die manuelle Aenderung der Zuordnung erlauben.
- Das System soll die Kategorisierung fuer die Portfolio-Aggregation (CMP-3.2.1) bereitstellen.

---

## Preconditions

- Mindestens ein Konto oder Depot ist erfasst.
- Nutzer ist authentifiziert.

---

## Behavior

1. System erkennt den Kontotyp (Girokonto, Sparkonto, Depot) und schlaegt eine Asset-Klasse vor.
2. Fuer Depot-Positionen: System liest die ISIN und ordnet ueber den Instrument-Typ die Asset-Klasse zu.
3. Nutzer kann die Zuordnung per Dropdown aendern.
4. System speichert die Zuordnung und aktualisiert die Aggregationsansicht.
5. Bei Aenderung wird ein Audit-Event "ASSET_CLASS_CHANGED" protokolliert.

---

## Postconditions

- Jedes Konto/Depot hat genau eine zugeordnete Asset-Klasse.
- Die Aggregationsberechnung (CMP-3.2.1) nutzt die aktuelle Zuordnung.
- Aenderungshistorie ist im Audit-Log verfuegbar.

---

## Error Handling

- Das System soll bei unbekanntem Instrument-Typ die Kategorie "Sonstige" vorschlagen.
- Das System soll bei fehlender ISIN eine manuelle Zuordnung erzwingen.

---

## Acceptance Criteria (functional)

- [ ] Tagesgeldkonto wird automatisch als "Tagesgeld" kategorisiert.
- [ ] ETF-Position (ISIN mit "ETF" im Instrument-Typ) wird als "ETFs" kategorisiert.
- [ ] Manuelle Aenderung von "Aktien" zu "Fonds" wird gespeichert und in Aggregation uebernommen.
- [ ] Audit-Log enthaelt den Kategorisierungswechsel mit Zeitstempel.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
