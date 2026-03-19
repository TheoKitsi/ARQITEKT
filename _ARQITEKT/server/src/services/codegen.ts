import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, extname, relative } from 'path';
import { resolveProjectById } from './projects.js';
import { sendChatMessage } from './llm.js';
import type { ChatMessage } from '../types/project.js';

interface CodegenResult {
  success: boolean;
  filesProcessed: number;
  filesModified: number;
  logs: string[];
}

/** Maximum file size in bytes — files larger than this are skipped (unlikely to be stubs). */
const MAX_FILE_SIZE = 50 * 1024; // 50 KB

/** Maximum number of retry attempts for each LLM call. */
const MAX_RETRIES = 2;

/** Delay between retries in milliseconds (base for exponential backoff). */
const RETRY_BASE_DELAY_MS = 1000;

/**
 * Sleep for the given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract the best code block from an LLM response.
 * Handles multiple markdown fence blocks — selects the longest one.
 * Falls back to the raw content if no fences are found.
 * Always trims leading/trailing whitespace.
 */
function extractCode(raw: string): string {
  const fencePattern = /```(?:\w+)?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  let longest = '';

  while ((match = fencePattern.exec(raw)) !== null) {
    const block = match[1]!;
    if (block.length > longest.length) {
      longest = block;
    }
  }

  const code = longest.length > 0 ? longest : raw;
  return code.trim();
}

/**
 * Recursively collect all candidate file paths from a directory.
 */
async function collectFiles(
  dirPath: string,
  extensions: Set<string>
): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const nested = await collectFiles(fullPath, extensions);
      results.push(...nested);
      continue;
    }

    if (extensions.has(extname(entry.name))) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Run AI-powered code generation on scaffold stubs.
 * Finds files with TODO comments and fills them using LLM.
 *
 * Files are processed sequentially (one at a time) to avoid rate limiting
 * from the LLM provider. They are sorted by path for deterministic ordering.
 */
export async function generateCode(
  projectId: string,
  model?: string
): Promise<CodegenResult> {
  const appPath = join(await resolveProjectById(projectId), 'app');
  const logs: string[] = [];
  let filesProcessed = 0;
  let filesModified = 0;

  const codeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.dart']);

  try {
    // Step 1: Collect all candidate files and sort by path for deterministic order
    const allFiles = await collectFiles(appPath, codeExtensions);
    allFiles.sort((a, b) => a.localeCompare(b));

    // Step 2: Filter to only files containing TODO stubs, respecting size limits
    const stubFiles: Array<{ path: string; content: string }> = [];

    for (const filePath of allFiles) {
      // Max file size check — skip files larger than 50 KB
      const fileStat = await stat(filePath);
      if (fileStat.size > MAX_FILE_SIZE) {
        const relPath = relative(appPath, filePath);
        logs.push(`Skipped (>50KB): ${relPath}`);
        continue;
      }

      const content = await readFile(filePath, 'utf-8');
      if (content.includes('// TODO: ARQITEKT') || content.includes('/* TODO: ARQITEKT */')) {
        stubFiles.push({ path: filePath, content });
      }
    }

    const total = stubFiles.length;
    logs.push(`Found ${total} stub file(s) to process.\n`);

    // Step 3: Process files sequentially (one at a time) to avoid rate limiting
    for (let i = 0; i < stubFiles.length; i++) {
      const { path: filePath, content } = stubFiles[i]!;
      const relPath = relative(appPath, filePath);

      filesProcessed++;
      logs.push(`[${i + 1}/${total}] Processing: ${relPath}`);

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content:
            'You are a code generation assistant. Fill in the TODO stubs with working implementation code. Keep the same file structure and imports. Only return the complete file content, no explanations.',
        },
        {
          role: 'user',
          content: `Fill in the TODO stubs in this file:\n\n${content}`,
        },
      ];

      // Retry logic — up to MAX_RETRIES attempts with delay between each
      let lastError: Error | undefined;
      let generated = false;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
            logs.push(`  -> Retry ${attempt}/${MAX_RETRIES} (waiting ${delay}ms)...`);
            await sleep(delay);
          }

          const result = await sendChatMessage(messages, model);
          const code = extractCode(result.content);

          await writeFile(filePath, code, 'utf-8');
          filesModified++;
          logs.push(`  -> Modified: ${relPath}`);
          generated = true;
          break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }

      if (!generated) {
        logs.push(
          `  -> Failed after ${MAX_RETRIES + 1} attempts, skipping: ${lastError?.message ?? 'Unknown error'}`
        );
      }
    }

    logs.push(`\nCodegen complete: ${filesProcessed} files processed, ${filesModified} modified`);
    return { success: true, filesProcessed, filesModified, logs };
  } catch (err) {
    return {
      success: false,
      filesProcessed,
      filesModified,
      logs: [...logs, `Error: ${err instanceof Error ? err.message : 'Unknown error'}`],
    };
  }
}
