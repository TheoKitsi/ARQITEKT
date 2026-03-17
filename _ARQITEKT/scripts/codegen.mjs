// ============================================================================
// ARQITEKT — LLM Code Generator
// ============================================================================
// Fills scaffold stubs with AI-generated implementations.
// Reads LLM config from _ARQITEKT/config/llm.yaml.
// Processes: FN first → CMP second → Pages last.
//
// Usage: node scripts/codegen.mjs <projectDir>
//
// Fallback: If no LLM key is set, generates COPILOT_PROMPTS.md instead.
// ============================================================================

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const HUB_ROOT = join(__dirname, '..');

// ============================================================================
// YAML parser (minimal, same as dashboard.mjs)
// ============================================================================
function parseYaml(content) {
  const result = {};
  let currentSection = null;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const sectionMatch = trimmed.match(/^(\w[\w_-]*):\s*$/);
    if (sectionMatch) { currentSection = sectionMatch[1]; result[currentSection] = {}; continue; }
    if (currentSection) {
      const kvMatch = trimmed.match(/^(\w[\w_-]*):\s*(.+)/);
      if (kvMatch) { let v = kvMatch[2].replace(/^["']|["']$/g, ''); result[currentSection][kvMatch[1]] = isNaN(v) ? v : Number(v); }
    }
  }
  return result;
}

// ============================================================================
// Load LLM config
// ============================================================================
function loadLLMConfig() {
  const cfgPath = join(HUB_ROOT, 'config', 'llm.yaml');
  if (!existsSync(cfgPath)) return null;
  try {
    const cfg = parseYaml(readFileSync(cfgPath, 'utf-8'));
    const llm = cfg.llm || {};
    const apiKey = process.env[llm.api_key_env || 'ARQITEKT_LLM_KEY'] || '';
    if (!apiKey) return null;
    return {
      endpoint: llm.endpoint || 'https://api.deepseek.com/v1/chat/completions',
      model: llm.model || 'deepseek-chat',
      apiKey,
      temperature: llm.temperature || 0.3,
      maxTokens: llm.max_tokens || 4096,
    };
  } catch { return null; }
}

// ============================================================================
// LLM API call with retry
// ============================================================================
function callLLM(config, systemPrompt, userPrompt, retries = 3) {
  return new Promise((resolve, reject) => {
    function attempt(n) {
      const body = JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      });

      const url = new URL(config.endpoint);
      const isHttps = url.protocol === 'https:';
      const mod = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + config.apiKey,
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = mod.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 429 && n > 0) {
            const retryAfter = parseInt(res.headers['retry-after'] || '5') * 1000;
            setTimeout(() => attempt(n - 1), retryAfter);
            return;
          }
          if (res.statusCode !== 200 && n > 0) {
            setTimeout(() => attempt(n - 1), 2000 * (4 - n));
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.message?.content || '';
            resolve(content);
          } catch {
            if (n > 0) setTimeout(() => attempt(n - 1), 2000);
            else reject(new Error('Invalid LLM response'));
          }
        });
      });

      req.on('error', (err) => {
        if (n > 0) setTimeout(() => attempt(n - 1), 2000 * (4 - n));
        else reject(err);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        if (n > 0) setTimeout(() => attempt(n - 1), 2000);
        else reject(new Error('LLM request timeout'));
      });

      req.write(body);
      req.end();
    }

    attempt(retries);
  });
}

// ============================================================================
// Extract code from LLM response (strip markdown fences)
// ============================================================================
function extractCode(response, lang = 'tsx') {
  // Try to find fenced code block
  const fenceRegex = new RegExp('```(?:' + lang + '|typescript|ts|jsx|javascript)?\\s*\\n([\\s\\S]*?)```', 'i');
  const m = response.match(fenceRegex);
  if (m) return m[1].trim() + '\n';

  // If no fence found, use the whole response (might already be code)
  const trimmed = response.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('import') || trimmed.startsWith('export') || trimmed.startsWith("'use")) {
    return trimmed + '\n';
  }

  return trimmed + '\n';
}

// ============================================================================
// Security scanner — check for dangerous patterns
// ============================================================================
const BLOCKLIST = [
  /\beval\s*\(/,
  /\bexec\s*\(/,
  /\brequire\s*\(\s*['"]child_process['"]\s*\)/,
  /\b__proto__\b/,
  /\bdangerouslySetInnerHTML\b/,
  /\bnew\s+Function\s*\(/,
  /\bprocess\.env\b/,
];

function scanForDanger(code) {
  const warnings = [];
  for (const pattern of BLOCKLIST) {
    if (pattern.test(code)) {
      warnings.push('Dangerous pattern detected: ' + pattern.source);
    }
  }
  return warnings;
}

// ============================================================================
// Collect files to process from scaffold output
// ============================================================================
function collectStubFiles(appDir) {
  const srcDir = join(appDir, 'src');
  const fnFiles = [];
  const cmpFiles = [];
  const pageFiles = [];

  function scan(dir, collector, pattern) {
    if (!existsSync(dir)) return;
    for (const f of readdirSync(dir)) {
      if (f.endsWith('.module.css')) continue;
      const fp = join(dir, f);
      if (pattern.test(f)) {
        const content = readFileSync(fp, 'utf-8');
        if (content.includes('@generated')) {
          collector.push(fp);
        }
      }
    }
  }

  // FN files in lib/
  scan(join(srcDir, 'lib'), fnFiles, /^fn-.*\.ts$/);

  // CMP files in components/
  scan(join(srcDir, 'components'), cmpFiles, /^cmp-.*\.tsx$/);

  // Page files — recurse through app/
  function findPages(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) findPages(join(dir, entry.name));
      else if (entry.name === 'page.tsx') {
        const content = readFileSync(join(dir, entry.name), 'utf-8');
        if (content.includes('@generated')) pageFiles.push(join(dir, entry.name));
      }
    }
  }
  findPages(join(srcDir, 'app'));

  return { fnFiles, cmpFiles, pageFiles };
}

// ============================================================================
// Build context for LLM prompt from file header comments
// ============================================================================
function extractReqIdFromFile(content) {
  const m = content.match(/\/\/\s*(?:Function|Component|Page):\s*([\w.-]+)/);
  return m ? m[1] : null;
}

function findRequirementFile(projectDir, reqId) {
  if (!reqId) return null;
  const reqDir = join(projectDir, 'requirements');
  const prefix = reqId.split('-')[0]?.toUpperCase();
  const dirMap = { FN: 'functions', CMP: 'components', US: 'user-stories', SOL: 'solutions' };
  const subDir = dirMap[prefix];
  if (!subDir) return null;
  const dir = join(reqDir, subDir);
  if (!existsSync(dir)) return null;
  for (const f of readdirSync(dir).filter(f => f.endsWith('.md'))) {
    if (f.toUpperCase().startsWith(reqId.toUpperCase())) {
      return readFileSync(join(dir, f), 'utf-8');
    }
  }
  return null;
}

// ============================================================================
// Main Codegen Function
// ============================================================================
export async function codegen(projectDir) {
  const appDir = join(projectDir, 'app');
  if (!existsSync(appDir)) {
    console.error('No app/ directory found. Run scaffold first.');
    return { success: false, error: 'No scaffold found' };
  }

  const llmConfig = loadLLMConfig();
  if (!llmConfig) {
    console.log('No LLM key configured. Generating COPILOT_PROMPTS.md instead...');
    return generateCopilotPrompts(projectDir, appDir);
  }

  // Pre-flight check
  try {
    await callLLM(llmConfig, 'Reply with OK', 'Test', 1);
  } catch (err) {
    console.error('LLM endpoint not reachable: ' + err.message);
    console.log('Falling back to COPILOT_PROMPTS.md...');
    return generateCopilotPrompts(projectDir, appDir);
  }

  const { fnFiles, cmpFiles, pageFiles } = collectStubFiles(appDir);
  const allFiles = [...fnFiles, ...cmpFiles, ...pageFiles];
  const total = allFiles.length;
  let generated = 0;
  let errors = 0;
  const errorLog = [];

  console.log(`Codegen: ${total} files to process (${fnFiles.length} FN, ${cmpFiles.length} CMP, ${pageFiles.length} Pages)`);

  // Process in order: FN → CMP → Pages
  for (const filePath of allFiles) {
    const relPath = relative(appDir, filePath);
    const content = readFileSync(filePath, 'utf-8');
    const reqId = extractReqIdFromFile(content);
    const reqContent = findRequirementFile(projectDir, reqId);

    const isFN = filePath.includes('lib/fn-') || filePath.includes('lib\\fn-');
    const isCMP = filePath.includes('components/cmp-') || filePath.includes('components\\cmp-');
    const lang = isFN ? 'ts' : 'tsx';

    let systemPrompt, userPrompt;

    if (isFN) {
      systemPrompt = `You are a senior TypeScript developer. Implement the following function for a Next.js 15 application. 
Return ONLY the TypeScript code, no markdown fences, no explanation. 
The function should be well-typed with proper TypeScript types.
Use modern TypeScript features. Do not use 'any' type.`;
      userPrompt = `Current stub:\n\`\`\`ts\n${content}\n\`\`\`\n\n${reqContent ? 'Requirement specification:\n' + reqContent.slice(0, 3000) : ''}\n\nImplement this function completely. Keep the @generated header and export name.`;
    } else if (isCMP) {
      systemPrompt = `You are a senior React/Next.js developer. Implement the following React component for a Next.js 15 app with CSS Modules.
Return ONLY the TSX code, no markdown fences, no explanation.
Use the CSS module import already in the file. Use CSS custom properties (var(--...)) from the design tokens.
Use 'use client' directive when the component needs interactivity (forms, state, events).
Do not add external dependencies.`;
      userPrompt = `Current stub:\n\`\`\`tsx\n${content}\n\`\`\`\n\n${reqContent ? 'Requirement specification:\n' + reqContent.slice(0, 3000) : ''}\n\nImplement this component completely. Keep the @generated header and component name.`;
    } else {
      systemPrompt = `You are a senior Next.js developer. Implement the following page for a Next.js 15 app with CSS Modules.
Return ONLY the TSX code, no markdown fences, no explanation.
Pages are Server Components by default (no 'use client' unless needed).
Import and use the child components listed in the imports.`;
      userPrompt = `Current stub:\n\`\`\`tsx\n${content}\n\`\`\`\n\n${reqContent ? 'Requirement specification:\n' + reqContent.slice(0, 3000) : ''}\n\nImplement this page completely. Keep the @generated header and all imports.`;
    }

    try {
      process.stdout.write(`  [${generated + errors + 1}/${total}] ${relPath}...`);
      const response = await callLLM(llmConfig, systemPrompt, userPrompt);
      let code = extractCode(response, lang);

      // Security scan
      const warnings = scanForDanger(code);
      if (warnings.length > 0) {
        console.log(' WARNING: ' + warnings.join(', '));
        errorLog.push({ file: relPath, warnings });
        // Still write but mark as warning
        code = '// WARNING: Security scan flagged this file — review before use!\n// ' + warnings.join('\n// ') + '\n' + code;
      }

      writeFileSync(filePath, code, 'utf-8');
      generated++;
      console.log(' OK');
    } catch (err) {
      errors++;
      console.log(' FAILED: ' + err.message);
      errorLog.push({ file: relPath, error: err.message });
      // Keep the stub
    }

    // Rate limiting: 100ms between requests
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nCodegen complete: ${generated} files generated, ${errors} errors`);
  if (errorLog.length > 0) {
    console.log('Errors:');
    for (const e of errorLog) console.log('  - ' + e.file + ': ' + (e.error || e.warnings.join(', ')));
  }

  return { success: true, filesGenerated: generated, errors, errorLog };
}

// ============================================================================
// Fallback: Generate COPILOT_PROMPTS.md
// ============================================================================
function generateCopilotPrompts(projectDir, appDir) {
  const { fnFiles, cmpFiles, pageFiles } = collectStubFiles(appDir);
  const allFiles = [...fnFiles, ...cmpFiles, ...pageFiles];

  let md = '# ARQITEKT Copilot Prompts\n\n';
  md += 'Kein LLM-Key konfiguriert. Nutze diese Prompts in VS Code Copilot Agent Mode.\n\n';
  md += `Dateien: ${allFiles.length} (${fnFiles.length} FN, ${cmpFiles.length} CMP, ${pageFiles.length} Pages)\n\n---\n\n`;

  for (const filePath of allFiles) {
    const relPath = relative(appDir, filePath).replace(/\\/g, '/');
    const content = readFileSync(filePath, 'utf-8');
    const reqId = extractReqIdFromFile(content);
    const reqContent = findRequirementFile(projectDir, reqId);

    md += `## ${relPath}\n\n`;
    md += '```\n';
    md += `@workspace Implementiere die Datei ${relPath}`;
    if (reqContent) {
      const title = reqContent.match(/^#\s+(.+)$/m)?.[1] || reqId;
      md += ` basierend auf dem Requirement "${title}"`;
    }
    md += '. Behalte den @generated Header und die Export-Signatur.\n';
    md += '```\n\n';
  }

  writeFileSync(join(appDir, 'COPILOT_PROMPTS.md'), md, 'utf-8');
  console.log(`Generated COPILOT_PROMPTS.md with ${allFiles.length} prompts`);
  return { success: true, filesGenerated: 0, promptsGenerated: allFiles.length };
}

// ============================================================================
// CLI entry point
// ============================================================================
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const projectDir = process.argv[2] ? resolve(process.argv[2]) : null;
  if (!projectDir || !existsSync(projectDir)) {
    console.error('Usage: node scripts/codegen.mjs <projectDir>');
    process.exit(1);
  }
  codegen(projectDir).then(result => {
    if (result.error) {
      console.error(result.error);
      process.exit(1);
    }
  });
}
