// ============================================================================
// ARQITEKT — Requirements Migration Script
// ============================================================================
// Migrates requirements from the ARQITEKT monorepo into each app's own
// git repository. Copies requirements/ and config/project.yaml, then updates
// the central projects.yaml registry.
//
// Usage:
//   npx tsx scripts/migrate-requirements.ts --project SOCIAL --target /path/to/social-repo
//   npx tsx scripts/migrate-requirements.ts --all --target-base /path/to/repos
//
// The script does NOT delete the original files — they remain as a backup.
// ============================================================================

import { readFile, writeFile, mkdir, cp, access } from 'fs/promises';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

// ============================================================================
// Types
// ============================================================================

interface ProjectEntry {
  id: string;
  name: string;
  codename: string;
  mode: 'local' | 'external';
  path: string;
  github: string;
  description: string;
}

interface ProjectsRegistry {
  projects: ProjectEntry[];
}

interface AgentsYaml {
  agents: Array<{
    name: string;
    description: string;
    instructions: string;
  }>;
}

interface MigrateResult {
  projectId: string;
  codename: string;
  targetDir: string;
  copiedRequirements: boolean;
  copiedConfig: boolean;
  createdAgents: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARQITEKT_ROOT = resolve(__dirname, '..');
const WORKSPACE_ROOT = resolve(ARQITEKT_ROOT, '..');
const PROJECTS_YAML_PATH = join(ARQITEKT_ROOT, 'config', 'projects.yaml');

// ============================================================================
// Helpers
// ============================================================================

/** Check if a path exists on disk. */
async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Parse the projects registry YAML. */
async function readProjectsRegistry(): Promise<ProjectsRegistry> {
  const raw = await readFile(PROJECTS_YAML_PATH, 'utf-8');
  const parsed = yaml.load(raw) as ProjectsRegistry;
  if (!parsed || !Array.isArray(parsed.projects)) {
    throw new Error(`Invalid projects.yaml: expected a "projects" array`);
  }
  return parsed;
}

/** Write the projects registry YAML back to disk, preserving the header comment. */
async function writeProjectsRegistry(registry: ProjectsRegistry): Promise<void> {
  const header = `# ============================================================================
# ARQITEKT — Projects Registry
# ============================================================================
# Central registry of all projects managed by the Hub.
#
# Discovery modes:
#   "local"    — project lives in the ARQITEKT workspace (NNN_NAME pattern)
#   "external" — project lives in its own repo/directory outside the workspace
#
# For "local" projects, \`path\` is relative to the workspace root.
# For "external" projects, \`path\` is an absolute path to the project directory.
#
# The Hub will also auto-discover any NNN_* directories in the workspace
# that are NOT listed here (backward-compatible fallback).
# ============================================================================

`;
  const yamlStr = yaml.dump(registry, {
    indent: 2,
    lineWidth: 120,
    quotingType: '"',
    forceQuotes: true,
  });
  await writeFile(PROJECTS_YAML_PATH, header + yamlStr, 'utf-8');
}

/** Generate a basic agents.yaml for Copilot integration. */
function generateAgentsYaml(projectName: string, codename: string): string {
  const agentsConfig: AgentsYaml = {
    agents: [
      {
        name: 'requirements',
        description: `Requirements engineering agent for ${projectName}`,
        instructions: [
          `You are a requirements engineering assistant for the ${projectName} project (codename: ${codename}).`,
          'You help maintain and evolve the requirements tree following the ARQITEKT metamodel:',
          'BC > SOL > US > CMP > FN (with cross-cutting INF, ADR, NTF, FBK).',
          'Status workflow: idea > draft > review > approved > implemented.',
          'Requirements live in the requirements/ directory.',
        ].join('\n'),
      },
    ],
  };
  return yaml.dump(agentsConfig, { indent: 2, lineWidth: 120 });
}

// ============================================================================
// CLI argument parsing
// ============================================================================

interface CliArgs {
  project: string | null;
  all: boolean;
  target: string | null;
  targetBase: string | null;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    project: null,
    all: false,
    target: null,
    targetBase: null,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--project':
        args.project = argv[++i] ?? null;
        break;
      case '--target':
        args.target = argv[++i] ?? null;
        break;
      case '--all':
        args.all = true;
        break;
      case '--target-base':
        args.targetBase = argv[++i] ?? null;
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      default:
        console.warn(`[WARN] Unknown argument: ${arg}`);
    }
  }

  return args;
}

// ============================================================================
// Migration logic
// ============================================================================

/**
 * Migrate a single project's requirements to the target directory.
 * Returns a result summary.
 */
async function migrateProject(
  project: ProjectEntry,
  targetDir: string,
  dryRun: boolean,
): Promise<MigrateResult> {
  const result: MigrateResult = {
    projectId: project.id,
    codename: project.codename,
    targetDir,
    copiedRequirements: false,
    copiedConfig: false,
    createdAgents: false,
  };

  const sourceDir = join(WORKSPACE_ROOT, project.path);
  const reqSource = join(sourceDir, 'requirements');
  const configSource = join(sourceDir, 'config', 'project.yaml');

  // --- Validate source directory exists ---
  if (!(await pathExists(sourceDir))) {
    console.error(`[ERROR] Source directory does not exist: ${sourceDir}`);
    return result;
  }

  console.log(`\n--- Migrating ${project.id} (${project.name}) ---`);
  console.log(`  Source:  ${sourceDir}`);
  console.log(`  Target:  ${targetDir}`);

  if (dryRun) {
    console.log('  [DRY RUN] Skipping actual file operations.');
    return result;
  }

  // --- Copy requirements/ ---
  if (await pathExists(reqSource)) {
    const reqTarget = join(targetDir, 'requirements');
    await mkdir(reqTarget, { recursive: true });
    await cp(reqSource, reqTarget, { recursive: true });
    console.log(`  [OK] Copied requirements/ (${reqSource} -> ${reqTarget})`);
    result.copiedRequirements = true;
  } else {
    console.warn(`  [WARN] No requirements/ directory found at ${reqSource}`);
  }

  // --- Copy config/project.yaml ---
  if (await pathExists(configSource)) {
    const configTarget = join(targetDir, 'config', 'project.yaml');
    await mkdir(dirname(configTarget), { recursive: true });
    await cp(configSource, configTarget);
    console.log(`  [OK] Copied config/project.yaml`);
    result.copiedConfig = true;
  } else {
    console.warn(`  [WARN] No config/project.yaml found at ${configSource}`);
  }

  // --- Create .github/copilot/agents.yaml if it doesn't exist ---
  const agentsTarget = join(targetDir, '.github', 'copilot', 'agents.yaml');
  if (!(await pathExists(agentsTarget))) {
    await mkdir(dirname(agentsTarget), { recursive: true });
    const agentsContent = generateAgentsYaml(project.name, project.codename);
    await writeFile(agentsTarget, agentsContent, 'utf-8');
    console.log(`  [OK] Created .github/copilot/agents.yaml`);
    result.createdAgents = true;
  } else {
    console.log(`  [SKIP] .github/copilot/agents.yaml already exists`);
  }

  return result;
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log('============================================================');
  console.log('ARQITEKT — Requirements Migration');
  console.log('============================================================');

  const args = parseArgs(process.argv);

  // --- Validate arguments ---
  if (!args.all && !args.project) {
    console.error(
      'Usage:\n' +
      '  npx tsx scripts/migrate-requirements.ts --project SOCIAL --target /path/to/social-repo\n' +
      '  npx tsx scripts/migrate-requirements.ts --all --target-base /path/to/repos\n' +
      '\nOptions:\n' +
      '  --project <CODENAME>    Migrate a single project by codename\n' +
      '  --target <path>         Target directory for single-project migration\n' +
      '  --all                   Migrate all projects\n' +
      '  --target-base <path>    Base directory for --all (subdirs created per project)\n' +
      '  --dry-run               Show what would be done without copying files',
    );
    process.exit(1);
  }

  if (args.project && !args.target) {
    console.error('[ERROR] --project requires --target <path>');
    process.exit(1);
  }

  if (args.all && !args.targetBase) {
    console.error('[ERROR] --all requires --target-base <path>');
    process.exit(1);
  }

  // --- Read registry ---
  let registry: ProjectsRegistry;
  try {
    registry = await readProjectsRegistry();
  } catch (err) {
    console.error(`[ERROR] Failed to read projects registry: ${err}`);
    process.exit(1);
  }

  console.log(`Found ${registry.projects.length} project(s) in registry.`);

  // --- Determine which projects to migrate ---
  let projectsToMigrate: Array<{ project: ProjectEntry; targetDir: string }> = [];

  if (args.project) {
    const found = registry.projects.find(
      (p) => p.codename.toUpperCase() === args.project!.toUpperCase(),
    );
    if (!found) {
      console.error(
        `[ERROR] Project with codename "${args.project}" not found in registry.\n` +
        `Available codenames: ${registry.projects.map((p) => p.codename).join(', ')}`,
      );
      process.exit(1);
    }
    projectsToMigrate.push({
      project: found,
      targetDir: resolve(args.target!),
    });
  } else if (args.all) {
    const base = resolve(args.targetBase!);
    for (const project of registry.projects) {
      if (project.mode === 'external') {
        console.log(`[SKIP] ${project.id} — already external (mode: "external")`);
        continue;
      }
      const subDir = project.codename.toLowerCase();
      projectsToMigrate.push({
        project,
        targetDir: join(base, subDir),
      });
    }
  }

  if (projectsToMigrate.length === 0) {
    console.log('\nNo projects to migrate. All may already be external.');
    return;
  }

  console.log(`\nWill migrate ${projectsToMigrate.length} project(s):`);
  for (const { project, targetDir } of projectsToMigrate) {
    console.log(`  - ${project.codename} -> ${targetDir}`);
  }

  // --- Run migrations ---
  const results: MigrateResult[] = [];
  let registryUpdated = false;

  for (const { project, targetDir } of projectsToMigrate) {
    try {
      const result = await migrateProject(project, targetDir, args.dryRun);
      results.push(result);

      // Update registry if migration was successful (at least requirements copied)
      if (result.copiedRequirements && !args.dryRun) {
        const entry = registry.projects.find((p) => p.id === project.id);
        if (entry && entry.mode === 'local') {
          entry.mode = 'external';
          entry.path = targetDir;
          registryUpdated = true;
          console.log(`  [OK] Updated registry: ${project.id} mode -> "external"`);
        }
      }
    } catch (err) {
      console.error(`[ERROR] Migration failed for ${project.id}: ${err}`);
      results.push({
        projectId: project.id,
        codename: project.codename,
        targetDir,
        copiedRequirements: false,
        copiedConfig: false,
        createdAgents: false,
      });
    }
  }

  // --- Write updated registry ---
  if (registryUpdated) {
    try {
      await writeProjectsRegistry(registry);
      console.log(`\n[OK] Updated ${PROJECTS_YAML_PATH}`);
    } catch (err) {
      console.error(`[ERROR] Failed to write updated projects.yaml: ${err}`);
    }
  }

  // --- Summary ---
  console.log('\n============================================================');
  console.log('Migration Summary');
  console.log('============================================================');

  let successCount = 0;
  let failCount = 0;

  for (const r of results) {
    const status = r.copiedRequirements ? 'OK' : 'FAILED';
    if (r.copiedRequirements) successCount++;
    else failCount++;

    console.log(`  [${status}] ${r.codename}`);
    console.log(`         Target: ${r.targetDir}`);
    console.log(`         Requirements: ${r.copiedRequirements ? 'copied' : 'not copied'}`);
    console.log(`         Config:       ${r.copiedConfig ? 'copied' : 'not copied'}`);
    console.log(`         Agents:       ${r.createdAgents ? 'created' : 'skipped/existing'}`);
  }

  console.log(`\nTotal: ${successCount} succeeded, ${failCount} failed out of ${results.length}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
