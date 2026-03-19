import { readFile, readdir, writeFile, mkdir, realpath, stat, rename, rm } from 'fs/promises';
import { join, extname, resolve, dirname } from 'path';
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
 * Resolves symlinks to prevent symlink-based path traversal.
 */
async function assertSafePath(projectId: string, filePath: string): Promise<string> {
  const projectDir = resolve(config.workspaceRoot, projectId);
  const fullPath = resolve(projectDir, filePath);

  // Preliminary check before resolving symlinks
  if (!fullPath.startsWith(projectDir)) {
    throw Object.assign(
      new Error('Path traversal detected: path escapes project directory'),
      { status: 403 },
    );
  }

  // Resolve symlinks and re-check
  try {
    const realProjectDir = await realpath(projectDir);
    const realFullPath = await realpath(fullPath);
    if (!realFullPath.startsWith(realProjectDir)) {
      throw Object.assign(
        new Error('Path traversal detected: resolved path escapes project directory'),
        { status: 403 },
      );
    }
    return realFullPath;
  } catch (err) {
    // If realpath fails because the file doesn't exist yet (e.g. writing new file),
    // fall back to the string-based check which already passed
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return fullPath;
    }
    throw err;
  }
}

/**
 * List files in a project directory (recursive).
 */
export async function listProjectFiles(
  projectId: string,
  subPath = ''
): Promise<FileEntry[]> {
  await assertSafePath(projectId, subPath);
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

/** Maximum file size for read operations (10 MB). */
const MAX_READ_SIZE = 10 * 1024 * 1024;

/**
 * Read a file from a project.
 */
export async function readProjectFile(
  projectId: string,
  filePath: string
): Promise<{ content: string; language: string }> {
  const fullPath = await assertSafePath(projectId, filePath);

  const info = await stat(fullPath);
  if (info.size > MAX_READ_SIZE) {
    throw Object.assign(
      new Error(`File too large (${Math.round(info.size / 1024 / 1024)}MB). Maximum: 10MB`),
      { status: 413 },
    );
  }

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
  const fullPath = await assertSafePath(projectId, filePath);
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/') > 0 ? fullPath.lastIndexOf('/') : fullPath.lastIndexOf('\\'));
  await mkdir(dir, { recursive: true });
  await writeFile(fullPath, content, 'utf-8');
}

/**
 * Delete a file or directory from a project.
 */
export async function deleteProjectFile(
  projectId: string,
  filePath: string
): Promise<void> {
  const fullPath = await assertSafePath(projectId, filePath);
  const info = await stat(fullPath);
  await rm(fullPath, { recursive: info.isDirectory() });
}

/**
 * Rename (move) a file or directory within a project.
 */
export async function renameProjectFile(
  projectId: string,
  oldPath: string,
  newPath: string
): Promise<void> {
  const fullOld = await assertSafePath(projectId, oldPath);
  const fullNew = await assertSafePath(projectId, newPath);
  await mkdir(dirname(fullNew), { recursive: true });
  await rename(fullOld, fullNew);
}

/**
 * Create a directory in a project.
 */
export async function createProjectDirectory(
  projectId: string,
  dirPath: string
): Promise<void> {
  const fullPath = await assertSafePath(projectId, dirPath);
  await mkdir(fullPath, { recursive: true });
}
