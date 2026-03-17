---
type: function
id: FN-2.1.1.2
status: draft
parent: CMP-2.1.1
version: "1.0"
date: "2026-03-15"
triggers_notifications: ["NTF-CONSENT-EXPIRED"]
---

# FN-2.1.1.2: Kontostaende Abrufen

> **Parent**: [CMP-2.1.1](../components/CMP-2.1.1_PSD2_Kontoaggregations_Adapter.md)

---

## Functional Description

Das System muss taeglich die aktuellen Kontostaende aller verbundenen Konten ueber die PSD2-API abrufen und speichern.

- Das System soll einen taeglichen Cron-Job ausfuehren (06:00 UTC).
- Das System soll pro Konto den aktuellen Saldo (booked balance) und den verfuegbaren Saldo (available balance) speichern.
- Das System soll die Kontostaende als Zeitreihe fuer die Vermoegenshistorie bereithalten.

---

## Preconditions

- Mindestens ein aktiver PSD2-Consent existiert.
- Access-Token ist gueltig (nicht abgelaufen).
- finAPI-Service ist erreichbar.

---

## Behavior

1. Cron-Job startet taeglich um 06:00 UTC.
2. System iteriert ueber alle Nutzer mit aktivem Consent.
3. Pro Nutzer: System entschluesselt das Access-Token.
4. System ruft GET /accounts/balances bei finAPI auf.
5. Pro Konto: System speichert booked_balance, available_balance, Zeitstempel (UTC).
6. System erkennt Aenderungen zum Vortag und markiert diese.
7. Bei Fehler fuer ein Konto: System faehrt mit naechstem Konto fort und loggt den Fehler.

---

## Postconditions

- Aktuelle Kontostaende aller verbundenen Konten sind gespeichert.
- Zeitreihendaten fuer die Vermoegenshistorie sind aktualisiert.
- Fehlerhafte Abrufe sind geloggt.

---

## Error Handling

- Das System soll bei abgelaufenem Token den Consent-Status auf "expired" setzen und den Nutzer per E-Mail benachrichtigen.
- Das System soll bei finAPI-Rate-Limit (429) einen exponentiellen Backoff (1s, 2s, 4s, max 3 Retries) durchfuehren.
- Das System soll bei Netzwerkfehler den Abruf in 30 Minuten wiederholen (max 3 Versuche).

---

## Acceptance Criteria (functional)

- [ ] Kontostaende werden taeglich um 06:00 UTC abgerufen.
- [ ] Booked und available Balance sind separat gespeichert.
- [ ] Abgelaufener Token fuehrt zu Consent-Status "expired" und E-Mail-Benachrichtigung.
- [ ] Rate-Limit (429) wird mit Backoff behandelt.

---

## Notifications

- Bei abgelaufenem Token: E-Mail-Benachrichtigung an den Nutzer (NTF-CONSENT-EXPIRED).

---

## Conversation Flows

<!-- Keine Conversation Flows fuer diese Funktion. -->
