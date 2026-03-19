import { readFile, readdir, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { resolveProjectById } from './projects.js';
import { parseFrontmatter } from './frontmatter.js';
import type { ChatMessage } from '../types/project.js';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

/**
 * Get the conversations directory for a project, creating it if needed.
 */
async function getConversationsDir(projectId: string): Promise<string> {
  const dirPath = join(await resolveProjectById(projectId), 'requirements', 'conversations');
  await mkdir(dirPath, { recursive: true });
  return dirPath;
}

/**
 * Parse chat messages from a markdown body.
 * Messages are formatted as:
 *   ## User
 *   message text
 *
 *   ## Assistant
 *   response text
 */
function parseMessages(body: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  // Split on ## headings that indicate role
  const sections = body.split(/^## /m).filter(Boolean);

  for (const section of sections) {
    const newlineIndex = section.indexOf('\n');
    if (newlineIndex === -1) continue;

    const heading = section.substring(0, newlineIndex).trim().toLowerCase();
    const content = section.substring(newlineIndex + 1).trim();

    let role: ChatMessage['role'];
    if (heading === 'user') {
      role = 'user';
    } else if (heading === 'assistant') {
      role = 'assistant';
    } else if (heading === 'system') {
      role = 'system';
    } else {
      continue;
    }

    if (content) {
      messages.push({ role, content });
    }
  }

  return messages;
}

/**
 * Serialize chat messages to markdown body format.
 */
function serializeMessages(messages: ChatMessage[]): string {
  return messages
    .map((msg) => {
      const heading = msg.role.charAt(0).toUpperCase() + msg.role.slice(1);
      return `## ${heading}\n\n${msg.content}`;
    })
    .join('\n\n');
}

/**
 * List all conversations for a project.
 */
export async function listConversations(projectId: string): Promise<Conversation[]> {
  const dirPath = await getConversationsDir(projectId);
  const conversations: Conversation[] = [];

  let files: string[];
  try {
    files = await readdir(dirPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`Error reading conversations directory for ${projectId}:`, err);
    }
    return conversations;
  }

  const mdFiles = files.filter(
    (f) => f.endsWith('.md') && !f.startsWith('_') && !f.startsWith('.')
  );

  for (const file of mdFiles) {
    try {
      const content = await readFile(join(dirPath, file), 'utf-8');
      const { data: fm, body } = parseFrontmatter(content);

      conversations.push({
        id: fm.id as string || file.replace('.md', ''),
        title: fm.title as string || file.replace('.md', ''),
        messages: parseMessages(body),
        createdAt: fm.created as string || '',
      });
    } catch {
      // Skip unreadable files
    }
  }

  return conversations;
}

/**
 * Save a new conversation for a project.
 * Auto-generates CONV-{N} IDs based on existing conversations.
 */
export async function saveConversation(
  projectId: string,
  data: { title: string; messages: ChatMessage[] }
): Promise<Conversation> {
  const dirPath = await getConversationsDir(projectId);

  // Determine next CONV-{N} id
  let maxNum = 0;
  try {
    const files = await readdir(dirPath);
    for (const file of files) {
      const match = file.match(/^CONV-(\d+)/i);
      if (match) {
        const num = parseInt(match[1]!, 10);
        if (num > maxNum) maxNum = num;
      }
    }
  } catch {
    // Directory may not exist yet (already created by getConversationsDir)
  }

  const nextNum = maxNum + 1;
  const convId = `CONV-${nextNum}`;
  const createdAt = new Date().toISOString();

  const frontmatter = [
    '---',
    `id: "${convId}"`,
    `title: "${data.title.replace(/"/g, '\\"')}"`,
    `created: "${createdAt}"`,
    '---',
  ].join('\n');

  const body = serializeMessages(data.messages);
  const fileContent = `${frontmatter}\n\n${body}\n`;

  const fileName = `${convId}.md`;
  await writeFile(join(dirPath, fileName), fileContent, 'utf-8');

  return {
    id: convId,
    title: data.title,
    messages: data.messages,
    createdAt,
  };
}

/**
 * Read a single conversation by ID.
 */
export async function readConversation(
  projectId: string,
  convId: string
): Promise<Conversation> {
  const dirPath = await getConversationsDir(projectId);

  // Try direct filename match first
  const directPath = join(dirPath, `${convId}.md`);
  try {
    const content = await readFile(directPath, 'utf-8');
    const { data: fm, body } = parseFrontmatter(content);
    return {
      id: fm.id as string || convId,
      title: fm.title as string || convId,
      messages: parseMessages(body),
      createdAt: fm.created as string || '',
    };
  } catch {
    // Direct filename didn't match, search all files
  }

  // Search all files for matching frontmatter id
  let files: string[];
  try {
    files = await readdir(dirPath);
  } catch {
    const err = new Error(`Conversation "${convId}" not found in project "${projectId}"`) as Error & { status: number };
    err.status = 404;
    throw err;
  }

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    try {
      const content = await readFile(join(dirPath, file), 'utf-8');
      const { data: fm, body } = parseFrontmatter(content);
      if (fm.id === convId) {
        return {
          id: convId,
          title: fm.title as string || file.replace('.md', ''),
          messages: parseMessages(body),
          createdAt: fm.created as string || '',
        };
      }
    } catch {
      // Skip unreadable files
    }
  }

  const err = new Error(`Conversation "${convId}" not found in project "${projectId}"`) as Error & { status: number };
  err.status = 404;
  throw err;
}
