---
type: function
id: FN-6.2.1.1
status: draft
parent: CMP-6.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-6.2.1.1: Annuitaet Berechnen

> **Parent**: [CMP-6.2.1](../components/CMP-6.2.1_Tilgungsplan_Generator.md)

---

## Functional Description

Das System muss die monatliche Annuitaet berechnen aus: Darlehenssumme, Sollzinssatz und anfaenglicher Tilgungsrate. Formel: A = D * (z + t) / 12.

- Das System soll die exakte Annuitaetenformel verwenden: A = D * (z/12) / (1 - (1+z/12)^(-n)).
- Das System soll die Berechnung bei Eingabeaenderung automatisch aktualisieren.
- Das System soll die Annuitaet als monatlichen und jaehrlichen Wert anzeigen.

---

## Preconditions

- Darlehenssumme, Sollzinssatz und Tilgungsrate (oder Laufzeit) sind eingegeben.

---

## Behavior

1. Nutzer gibt ein: Darlehenssumme (EUR), Sollzinssatz (% p.a.), anfaengliche Tilgungsrate (% p.a.).
2. System berechnet die monatliche Annuitaet: A = D * (z + t) / 12.
3. Alternativ: System berechnet via exakte Formel wenn Laufzeit angegeben.
4. System zeigt die monatliche Rate und die jaehrliche Gesamtbelastung.
5. System aktualisiert bei jeder Eingabeaenderung automatisch (Debounce: 300ms).

---

## Postconditions

- Monatliche Annuitaet ist berechnet und angezeigt.
- Wert ist fuer den Tilgungsplan (FN-6.2.1.2) verfuegbar.

---

## Error Handling

- Das System soll bei Zinssatz = 0 die Tilgung ohne Zinsen berechnen (Rate = D * t / 12).
- Das System soll bei Darlehenssumme = 0 die Berechnung verhindern.
- Das System soll bei unrealistisch hoher Annuitaet (> 50% des Nettoeinkommens) eine Warnung anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Darlehen 300000 EUR, Zins 3.5%, Tilgung 2%: monatliche Rate = 1375 EUR.
- [ ] Aenderung des Zinssatzes von 3.5% auf 4.0% berechnet sofort neu.
- [ ] Zinssatz 0% fuehrt zu korrekter Berechnung ohne Fehler.
- [ ] Rate > 50% des Einkommens zeigt Warnung.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
