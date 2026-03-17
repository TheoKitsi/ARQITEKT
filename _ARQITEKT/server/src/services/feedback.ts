import { readFile, readdir, writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';
import { parseFrontmatter } from './frontmatter.js';
import type { FeedbackItem } from '../types/project.js';

/**
 * Get the feedback directory path for a project.
 */
function feedbackDir(projectId: string): string {
  return join(config.workspaceRoot, projectId, 'requirements', 'feedback');
}

/**
 * List all feedback items for a project.
 * Returns an empty array if the feedback directory does not exist.
 */
export async function listFeedback(projectId: string): Promise<FeedbackItem[]> {
  const dir = feedbackDir(projectId);
  const items: FeedbackItem[] = [];

  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    // Directory does not exist — no feedback yet
    return items;
  }

  const mdFiles = files.filter(
    (f) => f.endsWith('.md') && !f.startsWith('_') && !f.startsWith('.')
  );

  for (const file of mdFiles) {
    try {
      const content = await readFile(join(dir, file), 'utf-8');
      const { data: fm, body } = parseFrontmatter(content);

      items.push({
        id: fm.id as string || file.replace('.md', ''),
        title: fm.title as string || file.replace('.md', ''),
        description: body.trim(),
        source: (fm.source as FeedbackItem['source']) || 'manual',
        severity: (fm.severity as FeedbackItem['severity']) || 'wish',
        status: (fm.status as FeedbackItem['status']) || 'open',
        rating: fm.rating != null ? Number(fm.rating) : undefined,
        createdAt: (fm.created as string) || '',
      });
    } catch {
      // Skip unreadable files
    }
  }

  return items;
}

/**
 * Create a new feedback item.
 * Auto-generates the next FBK-{N} ID by scanning existing files.
 */
export async function createFeedback(
  projectId: string,
  data: {
    title: string;
    description?: string;
    source?: string;
    severity?: string;
    rating?: number;
  }
): Promise<FeedbackItem> {
  const dir = feedbackDir(projectId);

  // Ensure the feedback directory exists
  await mkdir(dir, { recursive: true });

  // Determine next ID number
  let maxNum = 0;
  try {
    const files = await readdir(dir);
    for (const file of files) {
      const match = file.match(/^FBK-(\d+)\.md$/);
      if (match) {
        const num = parseInt(match[1]!, 10);
        if (num > maxNum) maxNum = num;
      }
    }
  } catch {
    // Directory just created, no files yet
  }

  const nextNum = maxNum + 1;
  const fbkId = `FBK-${nextNum}`;
  const now = new Date().toISOString();

  const source = data.source || 'manual';
  const severity = data.severity || 'wish';
  const description = data.description || '';

  // Build YAML frontmatter
  const frontmatterLines = [
    '---',
    `id: "${fbkId}"`,
    `title: "${data.title}"`,
    `status: "open"`,
    `source: "${source}"`,
    `severity: "${severity}"`,
  ];

  if (data.rating != null) {
    frontmatterLines.push(`rating: ${data.rating}`);
  }

  frontmatterLines.push(`created: "${now}"`);
  frontmatterLines.push('---');

  const fileContent = frontmatterLines.join('\n') + '\n' + description + '\n';
  const filePath = join(dir, `${fbkId}.md`);

  await writeFile(filePath, fileContent, 'utf-8');

  return {
    id: fbkId,
    title: data.title,
    description,
    source: source as FeedbackItem['source'],
    severity: severity as FeedbackItem['severity'],
    status: 'open',
    rating: data.rating,
    createdAt: now,
  };
}

/**
 * Read a single feedback item by ID.
 * Returns the full item including its markdown body.
 */
export async function readFeedback(projectId: string, fbkId: string): Promise<FeedbackItem> {
  if (!/^FBK-\d+$/.test(fbkId)) {
    throw Object.assign(new Error(`Invalid feedback ID format: ${fbkId}`), { status: 400 });
  }

  const dir = feedbackDir(projectId);
  const filePath = join(dir, `${fbkId}.md`);

  const content = await readFile(filePath, 'utf-8');
  const { data: fm, body } = parseFrontmatter(content);

  return {
    id: (fm.id as string) || fbkId,
    title: (fm.title as string) || fbkId,
    description: body.trim(),
    source: (fm.source as FeedbackItem['source']) || 'manual',
    severity: (fm.severity as FeedbackItem['severity']) || 'wish',
    status: (fm.status as FeedbackItem['status']) || 'open',
    rating: fm.rating != null ? Number(fm.rating) : undefined,
    createdAt: (fm.created as string) || '',
  };
}

/**
 * Delete a feedback item by ID.
 * Validates the FBK ID format, then finds and removes the matching file.
 */
export async function deleteFeedback(projectId: string, fbkId: string): Promise<void> {
  if (!/^FBK-\d+$/.test(fbkId)) {
    throw Object.assign(new Error(`Invalid feedback ID format: ${fbkId}`), { status: 400 });
  }

  const dir = feedbackDir(projectId);
  const filePath = join(dir, `${fbkId}.md`);

  await unlink(filePath);
}
