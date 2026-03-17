---
type: function
id: FN-5.2.1.2
status: draft
parent: CMP-5.2.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-5.2.1.2: Zahlen Validieren

> **Parent**: [CMP-5.2.1](../components/CMP-5.2.1_Szenario_Erklaerungsmodul.md)

---

## Functional Description

Das System muss alle von der KI genannten Zahlen gegen die berechneten Werte pruefen. Bei Abweichung groesser 2% wird die KI-Zahl durch den korrekten Wert ersetzt und ein Korrektur-Hinweis angezeigt.

- Das System soll numerische Werte in der KI-Antwort per Regex extrahieren.
- Das System soll extrahierte Zahlen mit den Ground-Truth-Werten der Impact-Berechnung abgleichen.
- Das System soll bei Korrektur eine Annotation "Korrigierter Wert (KI-Angabe: X)" anzeigen.

---

## Preconditions

- KI-Antwort (Impact-Erklaerung) ist generiert.
- Ground-Truth-Werte aus der Impact-Berechnung sind verfuegbar.

---

## Behavior

1. System extrahiert alle numerischen Werte aus der KI-Antwort (Regex: Zahlen mit EUR, %, pp).
2. System ordnet extrahierte Zahlen den Ground-Truth-Werten zu (Matching via Kontext).
3. Pro Zahl: System berechnet die Abweichung: |KI-Wert - Ground-Truth| / Ground-Truth * 100.
4. Bei Abweichung <= 2%: KI-Wert wird beibehalten.
5. Bei Abweichung > 2%: KI-Wert wird durch Ground-Truth ersetzt.
6. System fuegt eine Korrektur-Annotation ein (Tooltip: "Korrigiert. KI-Angabe: X").
7. System loggt die Korrektur fuer Qualitaets-Monitoring.

---

## Postconditions

- Alle Zahlen in der KI-Antwort sind validiert.
- Abweichungen > 2% sind korrigiert und annotiert.
- Korrektur-Events sind geloggt.

---

## Error Handling

- Das System soll bei nicht-zuordenbarer Zahl die Zahl unkorrigiert lassen und eine Warnung loggen.
- Das System soll bei fehlender Ground-Truth die Validierung fuer diesen Wert ueberspringen.

---

## Acceptance Criteria (functional)

- [ ] KI sagt "Rendite-Delta: -520 EUR", Ground-Truth: -500 EUR (Abweichung 4%): Korrektur auf -500 EUR.
- [ ] KI sagt "Steuerlast: 1050 EUR", Ground-Truth: 1055 EUR (Abweichung 0.5%): Keine Korrektur.
- [ ] Korrektur-Annotation ist als Tooltip sichtbar.
- [ ] Korrektur wird im Quality-Monitoring-Log gespeichert.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
