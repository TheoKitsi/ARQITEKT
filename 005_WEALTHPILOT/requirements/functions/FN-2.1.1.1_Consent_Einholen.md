---
type: function
id: FN-2.1.1.1
status: draft
parent: CMP-2.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: []
---

# FN-2.1.1.1: Consent Einholen

> **Parent**: [CMP-2.1.1](../components/CMP-2.1.1_PSD2_Kontoaggregations_Adapter.md)

---

## Functional Description

Das System muss den Nutzer per OAuth2-Redirect zur Hausbank weiterleiten, um einen PSD2-AISP-Consent einzuholen. Der Consent erlaubt den Lesezugriff auf Kontostaende und Transaktionen fuer 90 Tage.

- Das System soll den OAuth2-Authorization-Code-Flow via finAPI implementieren.
- Das System soll den erhaltenen Access-Token sicher speichern (verschluesselt).
- Das System soll den Consent-Status persistent tracken (active/expired/revoked).

---

## Preconditions

- Nutzer ist authentifiziert.
- finAPI-Konfiguration (Client-ID, Client-Secret) ist fuer den Mandanten hinterlegt.
- Nutzer hat mindestens ein Bankkonto zur Verknuepfung bereit.

---

## Behavior

1. Nutzer klickt "Konto verknuepfen" und waehlt seine Bank aus der BLZ-Liste.
2. System initiiert den finAPI OAuth2-Flow: Redirect zur Bank-Login-Seite.
3. Nutzer authentifiziert sich bei der Bank und erteilt den Consent.
4. Bank redirected zurueck mit Authorization-Code.
5. System tauscht den Authorization-Code gegen ein Access-Token (finAPI API).
6. System speichert das Token verschluesselt (FN-1.1.1.4) mit Ablaufdatum (90 Tage).
7. System setzt den Consent-Status auf "active" und loest den initialen Sync aus.

---

## Postconditions

- Ein aktiver PSD2-Consent ist gespeichert.
- Access-Token ist verschluesselt in der Datenbank.
- Consent-Ablaufdatum ist berechnet (heute + 90 Tage).
- Der initiale Konto-Sync ist angestossen.

---

## Error Handling

- Das System soll bei Ablehnung des Consents durch den Nutzer zur Kontouebersicht zurueckleiten mit Hinweis "Consent nicht erteilt".
- Das System soll bei OAuth-Fehler (invalid_grant) den Vorgang abbrechen und einen erneuten Versuch anbieten.
- Das System soll bei finAPI-Timeout (>30s) einen Timeout-Fehler anzeigen.

---

## Acceptance Criteria (functional)

- [ ] Erfolgreicher Consent-Flow fuehrt zu gespeichertem Token mit Status "active".
- [ ] Ablaufdatum ist korrekt auf 90 Tage in der Zukunft gesetzt.
- [ ] Bank-seitige Ablehnung wird korrekt behandelt (kein Token gespeichert).
- [ ] Token ist in der Datenbank nur als Ciphertext vorhanden.

---

## Notifications

<!-- Keine Notifications fuer diese Funktion. -->

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
