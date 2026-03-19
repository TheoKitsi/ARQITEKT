import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { parseFrontmatter } from './frontmatter.js';
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
