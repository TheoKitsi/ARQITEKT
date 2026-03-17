import type { RequirementFrontmatter } from '../types/project.js';

/**
 * Parse YAML frontmatter from a markdown file.
 * Handles the --- delimited section at the top of .md files.
 * Returns data as Record<string, unknown> for flexible access.
 */
export function parseFrontmatter(content: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return {
      data: { type: 'Solution', id: '', title: '', status: 'idea' },
      body: content,
    };
  }

  const frontmatterStr = match[1]!;
  const body = match[2] || '';

  const data: Record<string, unknown> = {};
  for (const line of frontmatterStr.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value: unknown = line.substring(colonIndex + 1).trim();

    // Remove surrounding quotes
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    // Parse arrays
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    }

    data[key] = value;
  }

  return { data, body };
}

/**
 * Parse YAML frontmatter and narrow to RequirementFrontmatter.
 * Use this in services that work with requirement artifacts (tree building, etc).
 */
export function parseFrontmatterTyped(content: string): {
  data: RequirementFrontmatter;
  body: string;
} {
  const result = parseFrontmatter(content);
  return { data: result.data as unknown as RequirementFrontmatter, body: result.body };
}
