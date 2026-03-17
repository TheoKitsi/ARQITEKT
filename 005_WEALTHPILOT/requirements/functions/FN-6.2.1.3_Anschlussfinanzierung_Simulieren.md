---
type: function
id: FN-6.2.1.3
status: draft
parent: CMP-6.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.2.1.3: Anschlussfinanzierung Simulieren

> **Parent**: [CMP-6.2.1](../components/CMP-6.2.1_Tilgungsplan_Generator.md)

---

## Functional Description

Das System muss 3 Szenarien fuer die Anschlussfinanzierung nach Zinsbindungsende berechnen: aktueller Zins, +1pp, +2pp.

- Das System soll die Restschuld nach Zinsbindungsende als Basis verwenden.
- Das System soll fuer jedes Szenario einen neuen Tilgungsplan erstellen.
- Das System soll die 3 Szenarien nebeneinander vergleichen.

---

## Preconditions

- Tilgungsplan ist erstellt (FN-6.2.1.2).
- Restschuld nach Zinsbindungsende ist berechnet.

---

## Behavior

1. System ermittelt die Restschuld nach Ablauf der Zinsbindung.
2. System erstellt 3 Szenarien: (1) aktueller Zins, (2) aktueller Zins + 1pp, (3) aktueller Zins + 2pp.
3. Pro Szenario: System berechnet die neue Annuitaet mit der Restschuld und dem neuen Zinssatz.
4. Pro Szenario: System erstellt einen neuen Tilgungsplan.
5. System zeigt die 3 Szenarien in einer Vergleichstabelle: Zinssatz, monatliche Rate, Gesamtlaufzeit, Gesamtzinsen.

---

## Postconditions

- 3 Anschlussfinanzierungs-Szenarien sind berechnet.
- Vergleichstabelle ist angezeigt.

---

## Error Handling

- Das System soll bei Restschuld = 0 die Anschlussfinanzierung ueberspringen (Darlehen bereits getilgt).
- Das System soll bei unrealistischem Zinssatz (> 15%) eine Warnung anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Restschuld 200000 EUR, aktuell 3.5%: Szenario 1 = 3.5%, Szenario 2 = 4.5%, Szenario 3 = 5.5%.
- [ ] Vergleichstabelle zeigt unterschiedliche monatliche Raten.
- [ ] Restschuld 0: Kein Anschlussfinanzierungs-Bereich angezeigt.
- [ ] +2pp-Szenario zeigt hoehere Rate und laengere Laufzeit.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
