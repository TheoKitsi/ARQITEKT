import { readFile, readdir, writeFile, mkdir } from 'fs/promises';
import { join, extname, resolve } from 'path';
import { config } from '../config.js';
import { resolveProjectById } from './projects.js';

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileEntry[];
}

/** Directories to skip during recursive listing. */
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build',
  '.gradle', '__pycache__', '.dart_tool', '.idea', '.vscode',
]);

/**
 * Validate a file path is within the project directory (path traversal protection).
 */
function assertSafePath(projectId: string, filePath: string): string {
  const projectDir = resolve(config.workspaceRoot, projectId);
  const fullPath = resolve(projectDir, filePath);

  if (!fullPath.startsWith(projectDir)) {
    throw Object.assign(
      new Error('Path traversal detected: path escapes project directory'),
      { status: 403 },
    );
  }

  return fullPath;
}

/**
 * List files in a project directory (recursive).
 */
export async function listProjectFiles(
  projectId: string,
  subPath = ''
): Promise<FileEntry[]> {
  assertSafePath(projectId, subPath);
  const base = join(await resolveProjectById(projectId), subPath);
  const entries = await readdir(base, { withFileTypes: true });
  const result: FileEntry[] = [];

  for (const e of entries) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;

    const entry: FileEntry = {
      name: e.name,
      path: join(subPath, e.name).replace(/\\/g, '/'),
      type: e.isDirectory() ? 'directory' : 'file',
    };

    if (e.isDirectory()) {
      entry.children = await listProjectFiles(projectId, join(subPath, e.name));
    }

    result.push(entry);
  }

  return result;
}

/**
 * Read a file from a project.
 */
export async function readProjectFile(
  projectId: string,
  filePath: string
): Promise<{ content: string; language: string }> {
  const fullPath = assertSafePath(projectId, filePath);
  const content = await readFile(fullPath, 'utf-8');
  const ext = extname(filePath).slice(1);

  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescriptreact',
    js: 'javascript',
    jsx: 'javascriptreact',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    css: 'css',
    html: 'html',
    py: 'python',
    dart: 'dart',
    xml: 'xml',
    sh: 'shell',
    bat: 'bat',
    sql: 'sql',
  };

  return { content, language: languageMap[ext] || 'plaintext' };
}

/**
 * Write a file to a project.
 */
export async function writeProjectFile(
  projectId: string,
  filePath: string,
  content: string
): Promise<void> {
  const fullPath = assertSafePath(projectId, filePath);
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/') > 0 ? fullPath.lastIndexOf('/') : fullPath.lastIndexOf('\\'));
  await mkdir(dir, { recursive: true });
  await writeFile(fullPath, content, 'utf-8');
}
