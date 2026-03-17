// create-ntfs.cjs — Create all 8 NTF notification spec files
const fs = require('fs');
const path = require('path');

const NTF_DIR = path.join(__dirname, '..', 'requirements', 'notifications');

const ntfs = [
  {
    id: 'NTF-1', slug: 'Sync_Fehlgeschlagen',
    title: 'Sync Fehlgeschlagen',
    channels: ['In-App', 'E-Mail'],
    triggers: [
      { fn: 'FN-2.1.1.4', event: 'PSD2-Sync-Fehler', condition: 'finAPI-API gibt Fehlercode zurueck oder Timeout > 30s.' },
      { fn: 'FN-2.2.1.2', event: 'Depot-Sync-Fehler', condition: 'Kursimport oder Positionsabgleich schlaegt fehl.' }
    ],
    push: { title: 'Synchronisation fehlgeschlagen', body: 'Die Kontosynchronisation fuer {bank_name} ist fehlgeschlagen. Bitte pruefen Sie die Verbindung.', action: 'Oeffne Kontoaggregation' },
    email: { subject: 'WealthPilot: Synchronisation fehlgeschlagen', template: 'sync-failed', cta: 'Verbindung pruefen', ctaUrl: '/accounts/connections' },
    sms: null,
    inApp: { title: 'Sync-Fehler', body: '{bank_name}: Synchronisation fehlgeschlagen.', duration: '10s', action: 'Verbindung pruefen' },
    preferences: [
      { setting: 'Kanalwahl', default: 'In-App + E-Mail', configurable: true },
      { setting: 'Haeufigkeit', default: 'Sofort', configurable: false },
      { setting: 'Gruppierung', default: 'Pro Bank', configurable: false }
    ],
    acceptance: [
      'In-App-Notification erscheint innerhalb von 5s nach Sync-Fehler.',
      'E-Mail wird innerhalb von 60s gesendet.',
      'Nutzer kann E-Mail-Benachrichtigung deaktivieren.',
      'Mehrere Fehler derselben Bank werden gruppiert (max 1 E-Mail pro Stunde).'
    ]
  },
  {
    id: 'NTF-2', slug: 'Bank_Verbindung_Getrennt',
    title: 'Bank Verbindung Getrennt',
    channels: ['In-App', 'E-Mail'],
    triggers: [
      { fn: 'FN-2.1.1.4', event: 'Consent abgelaufen', condition: 'PSD2-Consent (90 Tage) ist abgelaufen oder wurde widerrufen.' }
    ],
    push: { title: 'Bankverbindung getrennt', body: 'Die Verbindung zu {bank_name} ist getrennt. Bitte erneuern Sie die PSD2-Zustimmung.', action: 'Oeffne Kontoaggregation' },
    email: { subject: 'WealthPilot: Bankverbindung erneuern', template: 'bank-disconnect', cta: 'Verbindung erneuern', ctaUrl: '/accounts/reconnect/{bank_id}' },
    sms: null,
    inApp: { title: 'Verbindung getrennt', body: '{bank_name}: PSD2-Zustimmung abgelaufen.', duration: 'persistent', action: 'Jetzt erneuern' },
    preferences: [
      { setting: 'Kanalwahl', default: 'In-App + E-Mail', configurable: true },
      { setting: 'Haeufigkeit', default: 'Sofort + Reminder nach 7 Tagen', configurable: true },
      { setting: 'Gruppierung', default: 'Pro Bank', configurable: false }
    ],
    acceptance: [
      'In-App-Banner erscheint persistent bis Verbindung erneuert.',
      'E-Mail wird bei Trennung und als Reminder nach 7 Tagen gesendet.',
      'Nutzer kann Reminder deaktivieren.',
      'Nach Erneuerung: Banner verschwindet automatisch.'
    ]
  },
  {
    id: 'NTF-3', slug: 'Report_Fertig',
    title: 'Report Fertig',
    channels: ['In-App', 'E-Mail'],
    triggers: [
      { fn: 'FN-8.2.1.1', event: 'PDF-Report generiert', condition: 'Headless-Rendering ist abgeschlossen und PDF ist gespeichert.' }
    ],
    push: { title: 'Report fertig', body: 'Ihr Vermoegensreport "{report_name}" ist fertig und kann heruntergeladen werden.', action: 'Oeffne Reports' },
    email: { subject: 'WealthPilot: Ihr Report ist fertig', template: 'report-ready', cta: 'Report herunterladen', ctaUrl: '/reports/{report_id}/download' },
    sms: null,
    inApp: { title: 'Report fertig', body: '"{report_name}" steht zum Download bereit.', duration: '15s', action: 'Herunterladen' },
    preferences: [
      { setting: 'Kanalwahl', default: 'In-App + E-Mail', configurable: true },
      { setting: 'Haeufigkeit', default: 'Sofort', configurable: false },
      { setting: 'Gruppierung', default: 'Pro Report', configurable: false }
    ],
    acceptance: [
      'In-App-Notification erscheint innerhalb von 5s nach Report-Generierung.',
      'E-Mail enthaelt direkten Download-Link.',
      'Download-Link ist 30 Tage gueltig.',
      'Nutzer kann E-Mail deaktivieren (In-App bleibt immer aktiv).'
    ]
  },
  {
    id: 'NTF-4', slug: 'Audit_Integritaetsbruch',
    title: 'Audit Integritaetsbruch',
    channels: ['E-Mail'],
    triggers: [
      { fn: 'FN-9.1.1.2', event: 'Hash-Chain-Bruch', condition: 'Integritaetspruefung erkennt Inkonsistenz in der Hash-Kette.' }
    ],
    push: null,
    email: { subject: 'KRITISCH: Audit-Log Integritaetsbruch erkannt', template: 'audit-breach', cta: 'Audit-Log pruefen', ctaUrl: '/admin/audit?integrity=failed' },
    sms: null,
    inApp: null,
    preferences: [
      { setting: 'Kanalwahl', default: 'E-Mail (Admin)', configurable: false },
      { setting: 'Haeufigkeit', default: 'Sofort', configurable: false },
      { setting: 'Gruppierung', default: 'Keine', configurable: false }
    ],
    acceptance: [
      'E-Mail wird ausschliesslich an Compliance/Admin-Rolle gesendet.',
      'E-Mail enthaelt: betroffener Zeitraum, Anzahl betroffene Eintraege, Link zum Audit-Interface.',
      'E-Mail wird innerhalb von 30s nach Erkennung gesendet.',
      'Notification kann NICHT deaktiviert werden (regulatorisch).'
    ]
  },
  {
    id: 'NTF-5', slug: 'Loeschantrag_Eingegangen',
    title: 'Loeschantrag Eingegangen',
    channels: ['E-Mail'],
    triggers: [
      { fn: 'FN-9.2.1.1', event: 'Loeschantrag erfasst', condition: 'Nutzer hat DSGVO-Loeschantrag gestellt.' }
    ],
    push: null,
    email: { subject: 'WealthPilot: Ihr Loeschantrag ist eingegangen', template: 'deletion-request', cta: 'Status pruefen', ctaUrl: '/settings/privacy/deletion-status' },
    sms: null,
    inApp: null,
    preferences: [
      { setting: 'Kanalwahl', default: 'E-Mail', configurable: false },
      { setting: 'Haeufigkeit', default: 'Sofort', configurable: false },
      { setting: 'Gruppierung', default: 'Keine', configurable: false }
    ],
    acceptance: [
      'E-Mail bestaetigt den Eingang mit Ticket-Nummer.',
      'E-Mail nennt die 30-Tage-Frist.',
      'E-Mail wird innerhalb von 60s gesendet.',
      'Notification kann NICHT deaktiviert werden (DSGVO-Pflicht).'
    ]
  },
  {
    id: 'NTF-6', slug: 'Loeschbestaetigung',
    title: 'Loeschbestaetigung',
    channels: ['E-Mail'],
    triggers: [
      { fn: 'FN-9.2.1.4', event: 'Loeschung abgeschlossen', condition: 'Loeschung und/oder Pseudonymisierung ist ausgefuehrt.' }
    ],
    push: null,
    email: { subject: 'WealthPilot: Ihre Daten wurden geloescht', template: 'deletion-confirm', cta: 'PDF-Bestaetigung herunterladen', ctaUrl: '(als Attachment)' },
    sms: null,
    inApp: null,
    preferences: [
      { setting: 'Kanalwahl', default: 'E-Mail + PDF-Attachment', configurable: false },
      { setting: 'Haeufigkeit', default: 'Sofort', configurable: false },
      { setting: 'Gruppierung', default: 'Keine', configurable: false }
    ],
    acceptance: [
      'E-Mail enthaelt PDF-Bestaetigung als Attachment.',
      'PDF listet geloeschte Daten-Kategorien auf.',
      'PDF listet aufbewahrte Daten mit Rechtsgrundlage und Frist.',
      'Notification kann NICHT deaktiviert werden (DSGVO-Pflicht).'
    ]
  },
  {
    id: 'NTF-7', slug: 'Mandant_Willkommen',
    title: 'Mandant Willkommen',
    channels: ['E-Mail'],
    triggers: [
      { fn: 'FN-10.1.1.1', event: 'Mandant angelegt', condition: 'Neuer Mandant wurde erstellt und initialer Admin-Account generiert.' }
    ],
    push: null,
    email: { subject: 'Willkommen bei WealthPilot — Ihr Zugang', template: 'mandant-welcome', cta: 'Account aktivieren', ctaUrl: '/activate/{activation_token}' },
    sms: null,
    inApp: null,
    preferences: [
      { setting: 'Kanalwahl', default: 'E-Mail', configurable: false },
      { setting: 'Haeufigkeit', default: 'Einmalig', configurable: false },
      { setting: 'Gruppierung', default: 'Keine', configurable: false }
    ],
    acceptance: [
      'E-Mail wird an die Kontaktperson des Mandanten gesendet.',
      'E-Mail enthaelt Aktivierungslink mit 48h-Gueltigkeit.',
      'E-Mail enthaelt Subdomain und initiale Zugangsdaten.',
      'Aktivierungslink ist kryptographisch sicher (256-bit Token).'
    ]
  },
  {
    id: 'NTF-8', slug: 'Vermoegen_Schwellwert',
    title: 'Vermoegen Schwellwert',
    channels: ['In-App', 'E-Mail'],
    triggers: [
      { fn: 'FN-8.1.1.1', event: 'Vermoegen unter Schwellwert', condition: 'Gesamtvermoegen faellt unter nutzerdefinierten Schwellwert oder aendert sich um > 10% zum Vormonat.' }
    ],
    push: { title: 'Vermoegensaenderung', body: 'Ihr Gesamtvermoegen hat sich um {change_percent}% zum Vormonat geaendert.', action: 'Oeffne Dashboard' },
    email: { subject: 'WealthPilot: Vermoegensaenderung erkannt', template: 'threshold-alert', cta: 'Dashboard oeffnen', ctaUrl: '/dashboard' },
    sms: null,
    inApp: { title: 'Vermoegensaenderung', body: 'Gesamtvermoegen: {change_percent}% zum Vormonat.', duration: '10s', action: 'Details anzeigen' },
    preferences: [
      { setting: 'Kanalwahl', default: 'In-App', configurable: true },
      { setting: 'Schwellwert', default: '10%', configurable: true },
      { setting: 'Haeufigkeit', default: 'Taeglich (max 1x)', configurable: true }
    ],
    acceptance: [
      'Notification wird bei > 10% Aenderung (oder nutzerdef. Schwellwert) ausgeloest.',
      'Nutzer kann E-Mail aktivieren/deaktivieren.',
      'Nutzer kann Schwellwert anpassen (1-50%).',
      'Max 1 Notification pro Tag pro Nutzer.'
    ]
  }
];

// Generate files
let count = 0;
ntfs.forEach(ntf => {
  const filename = `${ntf.id}_${ntf.slug}.md`;
  const filePath = path.join(NTF_DIR, filename);

  // Channel config table
  const channelRows = ['Push', 'E-Mail', 'SMS', 'In-App'].map(ch => {
    const enabled = ntf.channels.includes(ch) || ntf.channels.includes(ch.replace('-', ''));
    // Check if channel has content
    const chKey = ch === 'Push' ? 'push' : ch === 'E-Mail' ? 'email' : ch === 'SMS' ? 'sms' : 'inApp';
    const hasContent = ntf[chKey] !== null;
    return `| ${ch} | ${hasContent ? 'Ja' : 'Nein'} | ${hasContent ? 'Normal' : '-'} | ${hasContent ? '-' : '-'} |`;
  }).join('\n');

  // Trigger table
  const triggerRows = ntf.triggers.map(t =>
    `| ${t.fn} | ${t.event} | ${t.condition} |`
  ).join('\n');

  // Content sections
  const pushSection = ntf.push
    ? `| Feld | Wert |\n| --- | --- |\n| Title | ${ntf.push.title} |\n| Body | ${ntf.push.body} |\n| Action | ${ntf.push.action} |`
    : '<!-- Push nicht aktiviert fuer diese Notification. -->';

  const emailSection = ntf.email
    ? `| Feld | Wert |\n| --- | --- |\n| Subject | ${ntf.email.subject} |\n| Template | ${ntf.email.template} |\n| CTA | ${ntf.email.cta} |\n| CTA-URL | ${ntf.email.ctaUrl} |`
    : '<!-- E-Mail nicht aktiviert fuer diese Notification. -->';

  const smsSection = ntf.sms
    ? `| Feld | Wert |\n| --- | --- |\n| Body | ${ntf.sms.body} |`
    : '<!-- SMS nicht aktiviert fuer diese Notification. -->';

  const inAppSection = ntf.inApp
    ? `| Feld | Wert |\n| --- | --- |\n| Title | ${ntf.inApp.title} |\n| Body | ${ntf.inApp.body} |\n| Duration | ${ntf.inApp.duration} |\n| Action | ${ntf.inApp.action} |`
    : '<!-- In-App nicht aktiviert fuer diese Notification. -->';

  // Preferences table
  const prefRows = ntf.preferences.map(p =>
    `| ${p.setting} | ${p.default} | ${p.configurable ? 'Ja' : 'Nein'} |`
  ).join('\n');

  // Acceptance criteria
  const acItems = ntf.acceptance.map(a => `- [ ] ${a}`).join('\n');

  const content = `---
type: notification
id: ${ntf.id}
title: "${ntf.title}"
status: draft
version: "1.0"
date: "2026-03-15"
channels: [${ntf.channels.map(c => `"${c}"`).join(', ')}]
crossCutting: true
---

# ${ntf.id}: ${ntf.title}

> **Type**: Notification (Cross-Cutting)

---

## Channel Configuration

| Channel | Enabled | Priority | Fallback |
| --- | --- | --- | --- |
${channelRows}

---

## Trigger

| FN-ID | Event | Condition |
| --- | --- | --- |
${triggerRows}

---

## Content per Channel

### Push

${pushSection}

### E-Mail

${emailSection}

### SMS

${smsSection}

### In-App (Toast/Snackbar)

${inAppSection}

---

## User Preferences

| Setting | Default | Configurable |
| --- | --- | --- |
${prefRows}

---

## i18n

| Sprache | Status |
| --- | --- |
| DE | Primaer |
| EN | Geplant |

---

## Acceptance Criteria

${acItems}
`;

  fs.writeFileSync(filePath, content, 'utf8');
  count++;
  console.log(`  [OK] ${filename}`);
});

console.log(`\n[create-ntfs] Created ${count}/${ntfs.length} NTF files`);
console.log(JSON.stringify({ count, total: ntfs.length }));
