import { readdir, readFile } from 'fs/promises';
import { join, basename } from 'path';
import { resolveProjectById } from './projects.js';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ExportIssue {
  title: string;
  body: string;
  labels: string[];
  milestone?: string;
  arqitekt_id: string;
  arqitekt_type: string;
  parent?: string;
}

interface ExportResult {
  project: string;
  exportedAt: string;
  format: string;
  milestones: string[];
  issues: ExportIssue[];
  summary: {
    milestones: number;
    epics: number;
    stories: number;
    components: number;
    total: number;
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS_LABELS: Record<string, string> = {
  idea: 'status:idea',
  draft: 'status:draft',
  review: 'status:review',
  approved: 'status:approved',
  implemented: 'status:implemented',
};

const TYPE_LABELS: Record<string, string> = {
  solution: 'type:epic',
  'user-story': 'type:story',
  component: 'type:component',
  function: 'type:task',
};

async function mdFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir);
    return entries.filter((f) => f.endsWith('.md')).sort();
  } catch {
    return [];
  }
}

function parseFrontmatter(content: string): Record<string, string> {
  const fm: Record<string, string> = {};
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m?.[1]) return fm;
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    fm[key] = val;
  }
  return fm;
}

function extractTitle(content: string, fileName: string): string {
  const m = content.match(/^#\s+(.+)$/m);
  return m?.[1] ?? basename(fileName, '.md');
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---[\s\S]*?---\r?\n*/, '').trim();
}

/* ------------------------------------------------------------------ */
/*  Export                                                             */
/* ------------------------------------------------------------------ */

export async function exportRequirements(
  projectId: string,
  format: 'github' | 'json' | 'csv' = 'github',
): Promise<ExportResult | string> {
  const projectPath = await resolveProjectById(projectId);
  const reqDir = join(projectPath, 'requirements');

  const solFiles = await mdFiles(join(reqDir, 'solutions'));
  const usFiles = await mdFiles(join(reqDir, 'user-stories'));
  const cmpFiles = await mdFiles(join(reqDir, 'components'));
  const fnFiles = await mdFiles(join(reqDir, 'functions'));

  const issues: ExportIssue[] = [];
  const milestones = new Set<string>();

  for (const solFile of solFiles) {
    const raw = await readFile(join(reqDir, 'solutions', solFile), 'utf-8');
    const fm = parseFrontmatter(raw);
    const title = extractTitle(raw, solFile);
    const body = stripFrontmatter(raw);
    const solNum = solFile.match(/SOL-(\d+)/)?.[1] ?? '0';
    const solKey = `SOL-${solNum}`;
    const milestoneName = `${solKey}: ${title.replace(/^SOL-\d+:\s*/, '')}`;
    milestones.add(milestoneName);

    issues.push({
      title: `[${solKey}] ${title.replace(/^SOL-\d+:\s*/, '')}`,
      body,
      labels: [TYPE_LABELS.solution, STATUS_LABELS[fm.status ?? ''] ?? 'status:idea', `sol:${solNum}`].filter((l): l is string => !!l),
      milestone: milestoneName,
      arqitekt_id: fm.id || solKey,
      arqitekt_type: 'solution',
    });

    // User stories linked to this solution
    const relatedUS = usFiles.filter((u) => new RegExp(`^US-${solNum}\\.`).test(u));
    for (const usFile of relatedUS) {
      const rawUS = await readFile(join(reqDir, 'user-stories', usFile), 'utf-8');
      const fmUS = parseFrontmatter(rawUS);
      const usTitle = extractTitle(rawUS, usFile);
      const usBody = stripFrontmatter(rawUS);
      const usId = usFile.match(/US-(\d+\.\d+)/)?.[1] ?? '';
      const usKey = `US-${usId}`;

      issues.push({
        title: `[${usKey}] ${usTitle.replace(/^US-[\d.]+:\s*/, '')}`,
        body: usBody,
        labels: [TYPE_LABELS['user-story'], STATUS_LABELS[fmUS.status ?? ''] ?? 'status:idea', `sol:${solNum}`].filter((l): l is string => !!l),
        milestone: milestoneName,
        arqitekt_id: fmUS.id || usKey,
        arqitekt_type: 'user-story',
        parent: solKey,
      });

      // Components
      const relatedCMP = cmpFiles.filter((c) => new RegExp(`^CMP-${usId.replace('.', '\\.')}\\.`).test(c));
      for (const cmpFile of relatedCMP) {
        const rawCMP = await readFile(join(reqDir, 'components', cmpFile), 'utf-8');
        const fmCMP = parseFrontmatter(rawCMP);
        const cmpTitle = extractTitle(rawCMP, cmpFile);
        let cmpBody = stripFrontmatter(rawCMP);
        const cmpId = cmpFile.match(/CMP-(\d+\.\d+\.\d+)/)?.[1] ?? '';
        const cmpKey = `CMP-${cmpId}`;

        // Functions as task checklist
        const relatedFN = fnFiles.filter((f) => new RegExp(`^FN-${cmpId.replace(/\./g, '\\.')}\\.`).test(f));
        if (relatedFN.length > 0) {
          cmpBody += '\n\n## Functions\n\n';
          for (const fnFile of relatedFN) {
            const rawFN = await readFile(join(reqDir, 'functions', fnFile), 'utf-8');
            const fnTitle = extractTitle(rawFN, fnFile);
            const fnId = fnFile.match(/FN-(\d+\.\d+\.\d+\.\d+)/)?.[1] ?? '';
            cmpBody += `- [ ] **FN-${fnId}**: ${fnTitle.replace(/^FN-[\d.]+:\s*/, '')}\n`;
          }
        }

        issues.push({
          title: `[${cmpKey}] ${cmpTitle.replace(/^CMP-[\d.]+:\s*/, '')}`,
          body: cmpBody,
          labels: [TYPE_LABELS.component, STATUS_LABELS[fmCMP.status ?? ''] ?? 'status:idea', `sol:${solNum}`].filter((l): l is string => !!l),
          milestone: milestoneName,
          arqitekt_id: fmCMP.id || cmpKey,
          arqitekt_type: 'component',
          parent: usKey,
        });
      }
    }
  }

  const result: ExportResult = {
    project: basename(projectPath),
    exportedAt: new Date().toISOString(),
    format,
    milestones: [...milestones],
    issues,
    summary: {
      milestones: milestones.size,
      epics: issues.filter((i) => i.arqitekt_type === 'solution').length,
      stories: issues.filter((i) => i.arqitekt_type === 'user-story').length,
      components: issues.filter((i) => i.arqitekt_type === 'component').length,
      total: issues.length,
    },
  };

  if (format === 'csv') {
    return issuesToCSV(issues);
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  CSV formatter                                                      */
/* ------------------------------------------------------------------ */

function issuesToCSV(issues: ExportIssue[]): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = 'id,type,title,labels,milestone,parent';
  const rows = issues.map((i) =>
    [
      escape(i.arqitekt_id),
      escape(i.arqitekt_type),
      escape(i.title),
      escape(i.labels.join(';')),
      escape(i.milestone ?? ''),
      escape(i.parent ?? ''),
    ].join(','),
  );
  return [header, ...rows].join('\n');
}
