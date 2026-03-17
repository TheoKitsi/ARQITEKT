// fn-processor.cjs — Shared processor for FN batch elaboration
const fs = require('fs');
const path = require('path');

const CMP_FILES = {
  'CMP-1.1.1': 'Konto_und_Depot_Erfassungsformular',
  'CMP-1.2.1': 'Einnahmen_Ausgaben_Modul',
  'CMP-1.3.1': 'Risikoprofil_Fragebogen',
  'CMP-2.1.1': 'PSD2_Kontoaggregations_Adapter',
  'CMP-2.2.1': 'Depot_Sync_Engine',
  'CMP-3.1.1': 'Rendite_Rechner',
  'CMP-3.2.1': 'Portfolio_Aggregator',
  'CMP-3.3.1': 'Benchmark_Vergleichsmodul',
  'CMP-4.1.1': 'Umschichtungs_Konfigurator',
  'CMP-4.2.1': 'Cross_Impact_Engine',
  'CMP-4.2.2': 'Impact_Visualisierung',
  'CMP-4.3.1': 'Optimierungs_Algorithmus',
  'CMP-5.1.1': 'Gemini_Chat_Interface',
  'CMP-5.2.1': 'Szenario_Erklaerungsmodul',
  'CMP-6.1.1': 'Nebenkostenrechner',
  'CMP-6.2.1': 'Tilgungsplan_Generator',
  'CMP-6.3.1': 'Miet_Kauf_Vergleichsmodul',
  'CMP-7.1.1': 'Produktkatalog_Suchmaschine',
  'CMP-7.2.1': 'Produkt_Matching_Engine',
  'CMP-8.1.1': 'Vermoegens_Dashboard_Widget',
  'CMP-8.2.1': 'Report_Generator',
  'CMP-9.1.1': 'Audit_Logger',
  'CMP-9.2.1': 'DSGVO_Loeschmodul',
  'CMP-10.1.1': 'Mandanten_Verwaltungsmodul',
  'CMP-10.2.1': 'White_Label_Branding_Modul'
};

function processBatch(fnData, batchName) {
  const dir = path.join(__dirname, '..', 'requirements', 'functions');
  const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  let count = 0;
  const errors = [];

  for (const fn of fnData) {
    const filename = allFiles.find(f => f.startsWith(fn.id + '_'));
    if (!filename) {
      errors.push(`${fn.id}: file not found`);
      continue;
    }
    const cmpFile = CMP_FILES[fn.parent];
    if (!cmpFile) {
      errors.push(`${fn.id}: parent ${fn.parent} not in CMP map`);
      continue;
    }
    const content = generateContent(fn, cmpFile);
    fs.writeFileSync(path.join(dir, filename), content, 'utf8');
    count++;
  }

  console.log(`[${batchName}] Updated ${count}/${fnData.length} FN files`);
  if (errors.length > 0) {
    console.error(`[${batchName}] Errors:`, errors);
  }
  return { count, errors, total: fnData.length };
}

function generateContent(fn, cmpFile) {
  const ntf = fn.triggers_notifications || [];
  const ntfYaml = ntf.length > 0 ? `[${ntf.map(n => `"${n}"`).join(', ')}]` : '[]';

  const notifSection = fn.notifications && fn.notifications.length > 0
    ? fn.notifications.map(n => `- ${n}`).join('\n')
    : '<!-- Keine Notifications fuer diese Funktion. -->';

  const convSection = fn.conversations && fn.conversations.length > 0
    ? fn.conversations.map(c => `- ${c}`).join('\n')
    : '<!-- Keine Conversation Flows fuer diese Funktion. -->';

  return `---
type: function
id: ${fn.id}
status: draft
parent: ${fn.parent}
version: "1.0"
date: "2026-03-15"
triggers_notifications: ${ntfYaml}
---

# ${fn.id}: ${fn.title}

> **Parent**: [${fn.parent}](../components/${fn.parent}_${cmpFile}.md)

---

## Functional Description

${fn.description}

---

## Preconditions

${fn.preconditions.map(p => `- ${p}`).join('\n')}

---

## Behavior

${fn.behavior.map((b, i) => `${i + 1}. ${b}`).join('\n')}

---

## Postconditions

${fn.postconditions.map(p => `- ${p}`).join('\n')}

---

## Error Handling

${fn.errors.map(e => `- ${e}`).join('\n')}

---

## Acceptance Criteria (functional)

${fn.acceptance.map(a => `- [ ] ${a}`).join('\n')}

---

## Notifications

${notifSection}

---

## Conversation Flows

${convSection}
`;
}

module.exports = { processBatch };
