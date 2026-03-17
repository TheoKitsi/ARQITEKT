// update-us.cjs — Elaborate all 24 User Story files
const fs = require('fs');
const path = require('path');

const US_DIR = path.join(__dirname, '..', 'requirements', 'user-stories');
const CMP_DIR = path.join(__dirname, '..', 'requirements', 'components');

// Build US → CMP mapping from CMP files
const cmpFiles = fs.readdirSync(CMP_DIR).filter(f => f.endsWith('.md'));
const US_CMP_MAP = {};
cmpFiles.forEach(f => {
  const content = fs.readFileSync(path.join(CMP_DIR, f), 'utf8');
  const idMatch = f.match(/^(CMP-[\d.]+)_(.+)\.md$/);
  const parentMatch = content.match(/parent:\s*(.+)/);
  if (idMatch && parentMatch) {
    const cmpId = idMatch[1];
    const title = idMatch[2].replace(/_/g, ' ');
    const parent = parentMatch[1].trim();
    if (!US_CMP_MAP[parent]) US_CMP_MAP[parent] = [];
    US_CMP_MAP[parent].push({ id: cmpId, title, file: f, status: 'draft' });
  }
});

// US → SOL mapping (parent)
const SOL_FILES = {
  'SOL-1': 'SOL-1_Finanzprofil_und_Onboarding.md',
  'SOL-2': 'SOL-2_Kontenaggregation.md',
  'SOL-3': 'SOL-3_Renditeberechnung_und_Analyse.md',
  'SOL-4': 'SOL-4_Cross_Impact_Simulation.md',
  'SOL-5': 'SOL-5_KI_gestuetzte_Beratung.md',
  'SOL-6': 'SOL-6_Immobilienbewertung.md',
  'SOL-7': 'SOL-7_Produktempfehlungen.md',
  'SOL-8': 'SOL-8_Reporting_Dashboard.md',
  'SOL-9': 'SOL-9_Compliance_und_Audit.md',
  'SOL-10': 'SOL-10_Mandantenverwaltung.md'
};

// NTF triggers per US (derived from child FN notifications)
const US_NOTIFICATIONS = {
  'US-2.1': [
    { trigger: 'PSD2-Sync fehlgeschlagen', ntf: 'NTF-SYNC-FAILED', channels: 'In-App, E-Mail' },
    { trigger: 'Bankverbindung getrennt', ntf: 'NTF-BANK-DISCONNECT', channels: 'In-App, E-Mail' }
  ],
  'US-2.2': [
    { trigger: 'Depot-Sync fehlgeschlagen', ntf: 'NTF-SYNC-FAILED', channels: 'In-App, E-Mail' }
  ],
  'US-8.2': [
    { trigger: 'PDF-Report fertig', ntf: 'NTF-REPORT-READY', channels: 'In-App, E-Mail' }
  ],
  'US-9.1': [
    { trigger: 'Hash-Chain-Bruch erkannt', ntf: 'NTF-AUDIT-BREACH', channels: 'E-Mail (Admin)' }
  ],
  'US-9.2': [
    { trigger: 'Loeschantrag eingegangen', ntf: 'NTF-DELETION-REQUEST', channels: 'E-Mail' },
    { trigger: 'Loeschung abgeschlossen', ntf: 'NTF-DELETION-CONFIRM', channels: 'E-Mail + PDF' }
  ],
  'US-10.1': [
    { trigger: 'Mandant angelegt', ntf: 'NTF-MANDANT-WELCOME', channels: 'E-Mail' }
  ]
};

const usFiles = fs.readdirSync(US_DIR).filter(f => f.endsWith('.md'));
let count = 0;
const errors = [];

usFiles.forEach(usFile => {
  try {
    const filePath = path.join(US_DIR, usFile);
    const content = fs.readFileSync(filePath, 'utf8');

    // Parse frontmatter
    const parts = content.split('---');
    const frontmatter = parts[1];
    const body = parts.slice(2).join('---').trim();

    // Extract fields
    const id = (frontmatter.match(/id:\s*(.+)/) || [])[1]?.trim();
    const parent = (frontmatter.match(/parent:\s*(.+)/) || [])[1]?.trim();
    if (!id || !parent) { errors.push(`${usFile}: Missing id or parent`); return; }

    // Extract title from heading
    const titleMatch = body.match(/^#\s*\S+:\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : usFile.replace(/^US-[\d.]+_/, '').replace(/_/g, ' ').replace('.md', '');

    // Extract existing User Story and Acceptance Criteria
    const userStoryMatch = body.match(/## User Story\s+([\s\S]*?)(?=\n## )/);
    const userStory = userStoryMatch ? userStoryMatch[1].trim() : '';

    const acMatch = body.match(/## Acceptance Criteria\s+([\s\S]*?)$/);
    const acceptanceCriteria = acMatch ? acMatch[1].trim() : '';

    // Build Components table
    const cmps = US_CMP_MAP[id] || [];
    let componentsTable = '| CMP-ID | Title | Status |\n| --- | --- | --- |\n';
    cmps.forEach(c => {
      componentsTable += `| [${c.id}](../components/${c.file}) | ${c.title} | ${c.status} |\n`;
    });

    // Build Notifications table
    const ntfs = US_NOTIFICATIONS[id];
    let notificationsSection;
    if (ntfs && ntfs.length > 0) {
      notificationsSection = '| Trigger | NTF | Channels |\n| --- | --- | --- |\n';
      ntfs.forEach(n => {
        notificationsSection += `| ${n.trigger} | ${n.ntf} | ${n.channels} |\n`;
      });
    } else {
      notificationsSection = '<!-- Keine Notifications fuer diese User Story. -->';
    }

    // Determine SOL file for back-link
    const solFile = SOL_FILES[parent] || `${parent}.md`;

    // Build new content
    const newContent = `---
type: user-story
id: ${id}
title: "${title}"
status: draft
parent: ${parent}
version: "1.0"
date: "2026-03-15"
---

# ${id}: ${title}

> **Parent**: [${parent}](../solutions/${solFile})

---

## User Story

${userStory}

---

## Acceptance Criteria

${acceptanceCriteria}

---

## Components

${componentsTable}
---

## Wireframe Reference

<!-- TODO: Link to wireframe files when available. -->

---

## Notifications

${notificationsSection}
`;

    fs.writeFileSync(filePath, newContent, 'utf8');
    count++;
    console.log(`  [OK] ${usFile}`);
  } catch (err) {
    errors.push(`${usFile}: ${err.message}`);
  }
});

console.log(`\n[update-us] Updated ${count}/${usFiles.length} US files`);
if (errors.length > 0) {
  console.log('Errors:', JSON.stringify(errors));
}
console.log(JSON.stringify({ count, errors, total: usFiles.length }));
