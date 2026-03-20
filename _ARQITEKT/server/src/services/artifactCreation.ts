import { readdir, writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { resolveProjectById } from './projects.js';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Count existing markdown files in a directory (ignoring hidden/underscore). */
async function countMdFiles(dirPath: string): Promise<number> {
  try {
    const files = await readdir(dirPath);
    return files.filter((f) => f.endsWith('.md') && !f.startsWith('_') && !f.startsWith('.')).length;
  } catch {
    return 0;
  }
}

/** Sanitize a title for use in a filename (letters, digits, hyphens only). */
function sanitizeFilename(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 60);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/*  Create Solution                                                    */
/* ------------------------------------------------------------------ */

export async function createSolution(
  projectId: string,
  title: string,
  notes?: string,
  _mode?: 'discuss' | 'direct',
): Promise<{ id: string; title: string; type: string; status: string; children: never[] }> {
  const projectPath = await resolveProjectById(projectId);
  const solDir = join(projectPath, 'requirements', 'solutions');

  // Ensure directory exists
  await mkdir(solDir, { recursive: true });

  const count = await countMdFiles(solDir);
  const solNum = count + 1;
  const solId = `SOL-${solNum}`;
  const date = todayISO();

  const body = `---
type: Solution
id: "${solId}"
title: "${title}"
status: draft
version: "1.0"
date: "${date}"
parent: "BC-1"
---

# ${solId}: ${title}

> **Parent**: [BC-1](../00_BUSINESS_CASE.md)
> **Date**: ${date}

---

## Solution Description

${notes || '<!-- Describe what this solution addresses and why it is needed. -->'}

---

## System Boundaries

<!-- What is included in this solution, what is not. -->
`;

  const filename = `${solId}_${sanitizeFilename(title)}.md`;
  await writeFile(join(solDir, filename), body, 'utf-8');

  return { id: solId, title, type: 'SOL', status: 'draft', children: [] as never[] };
}

/* ------------------------------------------------------------------ */
/*  Create User Story                                                  */
/* ------------------------------------------------------------------ */

export async function createUserStory(
  projectId: string,
  solutionId: string,
  title: string,
  notes?: string,
  _mode?: 'discuss' | 'direct',
): Promise<{ id: string; title: string; type: string; status: string; children: never[] }> {
  const projectPath = await resolveProjectById(projectId);
  const usDir = join(projectPath, 'requirements', 'user-stories');

  // Ensure directory exists
  await mkdir(usDir, { recursive: true });

  // Count existing US files under this solution
  let usFiles: string[];
  try {
    usFiles = await readdir(usDir);
  } catch {
    usFiles = [];
  }

  // Extract solution number from solutionId (e.g. "SOL-1" → "1")
  const solNum = solutionId.replace(/^SOL-/, '');
  const existingForSol = usFiles.filter(
    (f) => f.endsWith('.md') && f.startsWith(`US-${solNum}.`),
  ).length;

  const usNum = existingForSol + 1;
  const usId = `US-${solNum}.${usNum}`;
  const date = todayISO();

  const body = `---
type: UserStory
id: "${usId}"
title: "${title}"
status: draft
version: "1.0"
date: "${date}"
parent: "${solutionId}"
---

# ${usId}: ${title}

> **Parent**: [${solutionId}](../solutions/${solutionId}_*.md)

---

## User Story

${notes || 'As a {role}\nI want to {capability/action}\nSo that {benefit/value}.'}

---

## Acceptance Criteria

- [ ] AC-${solNum}.${usNum}.1: {Testable criterion}

---
`;

  const filename = `${usId}_${sanitizeFilename(title)}.md`;
  await writeFile(join(usDir, filename), body, 'utf-8');

  return { id: usId, title, type: 'US', status: 'draft', children: [] as never[] };
}

/* ------------------------------------------------------------------ */
/*  Create Business Case                                               */
/* ------------------------------------------------------------------ */

export async function createBusinessCase(
  projectId: string,
  title: string,
): Promise<{ id: string; title: string; type: string; status: string; children: never[] }> {
  const projectPath = await resolveProjectById(projectId);
  const reqDir = join(projectPath, 'requirements');
  const bcPath = join(reqDir, '00_BUSINESS_CASE.md');

  // Don't overwrite an existing BC
  try {
    await access(bcPath);
    throw Object.assign(new Error('Business Case already exists'), { status: 409 });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }

  await mkdir(reqDir, { recursive: true });

  const date = todayISO();
  const body = `---
type: BusinessCase
id: "BC-1"
title: "${title}"
status: draft
version: "1.0"
date: "${date}"
---

# BC-1: ${title}

> **Version**: 1.0
> **Date**: ${date}
> **Status**: draft

---

## 1. Business Objective

<!-- What is the core idea? What problem does it solve? Why now? -->

---

## 2. Scope

### In Scope

<!-- What is included? -->

### Out of Scope

<!-- What is explicitly NOT included? -->

---

## 3. Target Audience

<!-- Who uses the product? Personas, demographics, needs. -->

---

## 4. Core Principles

| Principle | Description |
|---|---|
| **{Principle 1}** | {Description} |

---
`;

  await writeFile(bcPath, body, 'utf-8');

  return { id: 'BC-1', title, type: 'BC', status: 'draft', children: [] as never[] };
}

/* ------------------------------------------------------------------ */
/*  Create Component                                                   */
/* ------------------------------------------------------------------ */

export async function createComponent(
  projectId: string,
  userStoryId: string,
  title: string,
  notes?: string,
  _mode?: 'discuss' | 'direct',
): Promise<{ id: string; title: string; type: string; status: string; children: never[] }> {
  const projectPath = await resolveProjectById(projectId);
  const cmpDir = join(projectPath, 'requirements', 'components');

  await mkdir(cmpDir, { recursive: true });

  let cmpFiles: string[];
  try {
    cmpFiles = await readdir(cmpDir);
  } catch {
    cmpFiles = [];
  }

  // Extract US number from userStoryId (e.g. "US-1.2" → "1.2")
  const usNum = userStoryId.replace(/^US-/, '');
  const existingForUS = cmpFiles.filter(
    (f) => f.endsWith('.md') && f.startsWith(`CMP-${usNum}.`),
  ).length;

  const cmpNum = existingForUS + 1;
  const cmpId = `CMP-${usNum}.${cmpNum}`;
  const date = todayISO();

  const body = `---
type: Component
id: "${cmpId}"
title: "${title}"
status: draft
version: "1.0"
date: "${date}"
parent: "${userStoryId}"
---

# ${cmpId}: ${title}

> **Parent**: [${userStoryId}](../user-stories/${userStoryId}_*.md)
> **Date**: ${date}

---

## Component Description

${notes || '<!-- Describe this technical module, its responsibilities, and boundaries. -->'}

---

## Interfaces

<!-- What APIs, events, or contracts does this component expose or consume? -->

---
`;

  const filename = `${cmpId}_${sanitizeFilename(title)}.md`;
  await writeFile(join(cmpDir, filename), body, 'utf-8');

  return { id: cmpId, title, type: 'CMP', status: 'draft', children: [] as never[] };
}

/* ------------------------------------------------------------------ */
/*  Create Function                                                    */
/* ------------------------------------------------------------------ */

export async function createFunction(
  projectId: string,
  componentId: string,
  title: string,
  notes?: string,
  _mode?: 'discuss' | 'direct',
): Promise<{ id: string; title: string; type: string; status: string; children: never[] }> {
  const projectPath = await resolveProjectById(projectId);
  const fnDir = join(projectPath, 'requirements', 'functions');

  await mkdir(fnDir, { recursive: true });

  let fnFiles: string[];
  try {
    fnFiles = await readdir(fnDir);
  } catch {
    fnFiles = [];
  }

  // Extract CMP number from componentId (e.g. "CMP-1.2.1" → "1.2.1")
  const cmpNum = componentId.replace(/^CMP-/, '');
  const existingForCMP = fnFiles.filter(
    (f) => f.endsWith('.md') && f.startsWith(`FN-${cmpNum}.`),
  ).length;

  const fnNum = existingForCMP + 1;
  const fnId = `FN-${cmpNum}.${fnNum}`;
  const date = todayISO();

  const body = `---
type: Function
id: "${fnId}"
title: "${title}"
status: draft
version: "1.0"
date: "${date}"
parent: "${componentId}"
---

# ${fnId}: ${title}

> **Parent**: [${componentId}](../components/${componentId}_*.md)
> **Date**: ${date}

---

## Description

${notes || '<!-- Describe the atomic behavior this function implements. -->'}

---

## Pre-conditions

- <!-- What must be true before this function executes? -->

## Post-conditions

- <!-- What is guaranteed after this function completes? -->

---
`;

  const filename = `${fnId}_${sanitizeFilename(title)}.md`;
  await writeFile(join(fnDir, filename), body, 'utf-8');

  return { id: fnId, title, type: 'FN', status: 'draft', children: [] as never[] };
}
