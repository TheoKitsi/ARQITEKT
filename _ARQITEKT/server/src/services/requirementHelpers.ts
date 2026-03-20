import { readFile, readdir, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { parseFrontmatter } from './frontmatter.js';
import { resolveProjectById } from './projects.js';
import type { RequirementStatus } from '../types/project.js';

/**
 * Valid status values in order (only forward transitions allowed).
 */
export const STATUS_ORDER: RequirementStatus[] = ['idea', 'draft', 'review', 'approved', 'implemented'];

/**
 * Extract a string field from parsed frontmatter.
 */
export function fmString(fm: Record<string, unknown>, key: string): string {
  const v = fm[key];
  return typeof v === 'string' ? v : '';
}

/**
 * Search all markdown files under a directory recursively for one whose
 * frontmatter `id` matches the given artifactId.
 * Returns the full file path and file content if found.
 */
export async function findArtifactFile(
  dirPath: string,
  artifactId: string
): Promise<{ filePath: string; content: string } | null> {
  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch {
    return null;
  }

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    let info;
    try {
      info = await stat(fullPath);
    } catch {
      continue;
    }

    if (info.isDirectory()) {
      const result = await findArtifactFile(fullPath, artifactId);
      if (result) return result;
    } else if (entry.endsWith('.md') && !entry.startsWith('_') && !entry.startsWith('.')) {
      try {
        const content = await readFile(fullPath, 'utf-8');
        const { data: fm } = parseFrontmatter(content);
        if (fm.id === artifactId) {
          return { filePath: fullPath, content };
        }
      } catch {
        // Skip unreadable files
      }
    }
  }

  return null;
}

/**
 * Read the full content (frontmatter + markdown body) of an artifact.
 */
export async function getArtifactContent(
  projectId: string,
  artifactId: string
): Promise<{ title: string; status: string; type: string; body: string; frontmatter: Record<string, unknown> }> {
  const reqPath = join(await resolveProjectById(projectId), 'requirements');
  const result = await findArtifactFile(reqPath, artifactId);

  if (!result) {
    const err = new Error(`Artifact "${artifactId}" not found in project "${projectId}"`) as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const { data: fm, body } = parseFrontmatter(result.content);
  return {
    title: fmString(fm, 'title'),
    status: fmString(fm, 'status') || 'idea',
    type: fmString(fm, 'type'),
    body,
    frontmatter: fm,
  };
}

/**
 * Update the markdown body (and optionally title) of an artifact.
 */
export async function updateArtifactContent(
  projectId: string,
  artifactId: string,
  newBody: string,
  newTitle?: string
): Promise<void> {
  const reqPath = join(await resolveProjectById(projectId), 'requirements');
  const result = await findArtifactFile(reqPath, artifactId);

  if (!result) {
    const err = new Error(`Artifact "${artifactId}" not found in project "${projectId}"`) as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const { filePath, content } = result;

  // Rebuild frontmatter section, updating title if provided
  const fmLines: string[] = [];
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    for (const line of fmMatch[1]!.split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) {
        fmLines.push(line);
        continue;
      }
      const key = line.substring(0, colonIdx).trim();
      if (key === 'title' && newTitle) {
        fmLines.push(`title: "${newTitle.replace(/"/g, '\\"')}"`);
      } else {
        fmLines.push(line);
      }
    }
  }

  const updatedContent = `---\n${fmLines.join('\n')}\n---\n${newBody}`;
  await writeFile(filePath, updatedContent, 'utf-8');
}
