import { readFile, readdir, stat, rm, writeFile, cp, mkdir } from 'fs/promises';
import { join, resolve, isAbsolute } from 'path';
import { config } from '../config.js';
import { parseYaml, dumpYaml } from './yaml.js';
import { getReadiness } from './requirements.js';
import type {
  Project, ProjectConfig, ProjectStats, LifecycleStage,
  ProjectRegistryEntry, ProjectsRegistry,
} from '../types/project.js';

/* ------------------------------------------------------------------ */
/*  Projects registry                                                  */
/* ------------------------------------------------------------------ */

const registryPath = join(config.hubRoot, 'config', 'projects.yaml');

/**
 * Load the projects registry from _ARQITEKT/config/projects.yaml.
 * Returns an empty list if the file doesn't exist.
 */
async function loadRegistry(): Promise<ProjectRegistryEntry[]> {
  try {
    const content = await readFile(registryPath, 'utf-8');
    const data = parseYaml(content) as unknown as ProjectsRegistry;
    return data.projects ?? [];
  } catch {
    return [];
  }
}

/**
 * Save the projects registry back to disk.
 */
async function saveRegistry(entries: ProjectRegistryEntry[]): Promise<void> {
  const data: ProjectsRegistry = { projects: entries };
  const content = dumpYaml(data as unknown as Record<string, unknown>);
  await writeFile(registryPath, content, 'utf-8');
}

/**
 * Resolve a project path from a registry entry.
 * Local paths are relative to workspace root; external paths are absolute.
 */
function resolveProjectPath(entry: ProjectRegistryEntry): string {
  if (entry.mode === 'external' && isAbsolute(entry.path)) {
    return entry.path;
  }
  return join(config.workspaceRoot, entry.path);
}

/**
 * Normalize raw parsed YAML into a flat ProjectConfig.
 * Handles both `project: { name, lifecycle: { state } }` and flat formats.
 */
function normalizeProjectConfig(raw: Record<string, unknown>): ProjectConfig {
  // Unwrap `project:` wrapper if present
  const data = (typeof raw.project === 'object' && raw.project !== null)
    ? (raw.project as Record<string, unknown>)
    : raw;

  // Extract lifecycle — may live inside `data` or as a top-level sibling of `project:`
  let lifecycle: LifecycleStage = 'planning';
  const rawLifecycle = data.lifecycle ?? raw.lifecycle;
  if (typeof rawLifecycle === 'string') {
    lifecycle = rawLifecycle as LifecycleStage;
  } else if (typeof rawLifecycle === 'object' && rawLifecycle !== null) {
    const lc = rawLifecycle as Record<string, unknown>;
    if (typeof lc.state === 'string') {
      lifecycle = lc.state as LifecycleStage;
    }
  }

  return {
    name: (data.name as string) || '',
    codename: (data.codename as string) || '',
    description: data.description as string | undefined,
    lifecycle,
    github: data.github as string | undefined,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    branding: typeof data.branding === 'object' ? data.branding as ProjectConfig['branding'] : undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Project listing — registry + auto-discovery fallback               */
/* ------------------------------------------------------------------ */

/**
 * List all projects.
 * Merges registry entries with auto-discovered NNN_* directories
 * (directories not already in the registry are added as discovered).
 */
export async function listProjects(): Promise<Project[]> {
  const registry = await loadRegistry();
  const registryIds = new Set(registry.map((e) => e.id));
  const projects: Project[] = [];

  // 1. Load projects from registry
  for (const entry of registry) {
    try {
      const projectPath = resolveProjectPath(entry);
      const configPath = join(projectPath, 'config', 'project.yaml');
      const configContent = await readFile(configPath, 'utf-8');
      const projectConfig = normalizeProjectConfig(parseYaml(configContent));

      const stats = await getProjectStats(projectPath);
      const readiness = await getReadiness(entry.id).catch(() => ({ authored: 0, approved: 0 }));

      projects.push({
        id: entry.id,
        path: projectPath,
        config: {
          ...projectConfig,
          name: projectConfig.name || entry.name,
          codename: projectConfig.codename || entry.codename,
          description: projectConfig.description || entry.description,
          github: projectConfig.github || entry.github,
        },
        stats,
        readiness,
      });
    } catch {
      // Registry entry points to a project that doesn't exist (yet) — skip
    }
  }

  // 2. Auto-discover NNN_* directories not in the registry
  try {
    const entries = await readdir(config.workspaceRoot, { withFileTypes: true });
    const unregistered = entries.filter(
      (e) => e.isDirectory() && /^\d{3}_/.test(e.name) && !registryIds.has(e.name)
    );

    for (const dir of unregistered) {
      try {
        const projectPath = join(config.workspaceRoot, dir.name);
        const configPath = join(projectPath, 'config', 'project.yaml');
        const configContent = await readFile(configPath, 'utf-8');
        const projectConfig = normalizeProjectConfig(parseYaml(configContent));

        const stats = await getProjectStats(projectPath);
        const readiness = await getReadiness(dir.name).catch(() => ({ authored: 0, approved: 0 }));

        projects.push({
          id: dir.name,
          path: projectPath,
          config: projectConfig,
          stats,
          readiness,
        });
      } catch {
        // Skip directories without valid config
      }
    }
  } catch {
    // Workspace root not accessible
  }

  return projects;
}

/* ------------------------------------------------------------------ */
/*  Get single project by ID                                           */
/* ------------------------------------------------------------------ */

/**
 * Get a single project by ID.
 * Looks up registry first, falls back to workspace directory.
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  const registry = await loadRegistry();
  const entry = registry.find((e) => e.id === projectId);

  const projectPath = entry
    ? resolveProjectPath(entry)
    : join(config.workspaceRoot, projectId);

  try {
    const configPath = join(projectPath, 'config', 'project.yaml');
    const configContent = await readFile(configPath, 'utf-8');
    const projectConfig = normalizeProjectConfig(parseYaml(configContent));

    const stats = await getProjectStats(projectPath);
    const readiness = await getReadiness(projectId).catch(() => ({ authored: 0, approved: 0 }));

    return {
      id: projectId,
      path: projectPath,
      config: {
        ...projectConfig,
        name: projectConfig.name || entry?.name || projectId,
        codename: projectConfig.codename || entry?.codename || projectId,
        description: projectConfig.description || entry?.description,
        github: projectConfig.github || entry?.github,
      },
      stats,
      readiness,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  Starter templates                                                   */
/* ------------------------------------------------------------------ */

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  artifacts: number;
}

/**
 * List available starter templates from template/starters/.
 */
export async function listStarterTemplates(): Promise<StarterTemplate[]> {
  const startersDir = join(config.hubRoot, 'template', 'starters');
  try {
    const entries = await readdir(startersDir, { withFileTypes: true });
    const templates: StarterTemplate[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const manifestPath = join(startersDir, entry.name, 'manifest.yaml');
        const raw = await readFile(manifestPath, 'utf-8');
        const manifest = parseYaml(raw) as Record<string, unknown>;
        templates.push({
          id: String(manifest.id ?? entry.name),
          name: String(manifest.name ?? entry.name),
          description: String(manifest.description ?? ''),
          artifacts: Number(manifest.artifacts ?? 0),
        });
      } catch {
        // Skip directories without valid manifest
      }
    }
    return templates;
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Create project                                                     */
/* ------------------------------------------------------------------ */

/**
 * Create a new project from template and add to registry.
 */
export async function createProject(
  name: string,
  description?: string,
  template?: string
): Promise<Project> {
  const entries = await readdir(config.workspaceRoot, { withFileTypes: true });
  const existing = entries
    .filter((e) => e.isDirectory() && /^\d{3}_/.test(e.name))
    .map((e) => parseInt(e.name.substring(0, 3), 10));

  const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  const codename = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const dirName = `${String(nextNum).padStart(3, '0')}_${codename}`;
  const projectPath = join(config.workspaceRoot, dirName);
  const templatePath = join(config.hubRoot, 'template');

  await cp(templatePath, projectPath, { recursive: true });

  // Overlay starter template requirements if specified
  if (template) {
    const starterReqDir = join(config.hubRoot, 'template', 'starters', template, 'requirements');
    try {
      await stat(starterReqDir);
      const targetReqDir = join(projectPath, 'requirements');
      await cp(starterReqDir, targetReqDir, { recursive: true });
    } catch {
      // Starter template not found — continue with blank template
    }
  }

  // Update project.yaml
  const configPath = join(projectPath, 'config', 'project.yaml');
  const configContent = `name: "${name}"\ncodename: "${codename}"\ndescription: "${description || ''}"\nlifecycle: planning\n`;
  await writeFile(configPath, configContent, 'utf-8');

  // Add to registry
  const registry = await loadRegistry();
  registry.push({
    id: dirName,
    name,
    codename,
    mode: 'local',
    path: dirName,
    description,
  });
  await saveRegistry(registry);

  return {
    id: dirName,
    path: projectPath,
    config: {
      name,
      codename,
      description,
      lifecycle: 'planning',
    },
    stats: { bc: 0, sol: 0, us: 0, cmp: 0, fn: 0, inf: 0, adr: 0, ntf: 0, conv: 0, fbk: 0 },
    readiness: { authored: 0, approved: 0 },
  };
}

/* ------------------------------------------------------------------ */
/*  Delete project                                                     */
/* ------------------------------------------------------------------ */

/**
 * Delete a project directory and remove from registry.
 */
export async function deleteProject(projectId: string): Promise<void> {
  const projectPath = await resolveProjectById(projectId);
  await stat(projectPath); // throws if not exists
  await rm(projectPath, { recursive: true, force: true });

  // Remove from registry
  const registry = await loadRegistry();
  const updated = registry.filter((e) => e.id !== projectId);
  if (updated.length !== registry.length) {
    await saveRegistry(updated);
  }
}

/* ------------------------------------------------------------------ */
/*  Import project                                                     */
/* ------------------------------------------------------------------ */

/**
 * Import an external project directory into the registry.
 * If sourcePath has config/project.yaml, register it as "external".
 * Otherwise, copy it into the workspace as a "local" project.
 */
export async function importProject(
  sourcePath: string,
  name: string,
  description?: string
): Promise<Project> {
  const resolvedSource = resolve(sourcePath);
  await stat(resolvedSource); // verify exists

  // Check if source has a config/project.yaml — treat as external registration
  let isExternal = false;
  try {
    await stat(join(resolvedSource, 'config', 'project.yaml'));
    isExternal = true;
  } catch {
    // No project.yaml — will copy into workspace
  }

  const codename = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');

  if (isExternal) {
    // Register as external project — don't copy files
    const configContent = await readFile(join(resolvedSource, 'config', 'project.yaml'), 'utf-8');
    const projectConfig = normalizeProjectConfig(parseYaml(configContent));

    const id = projectConfig.codename || codename;

    const registry = await loadRegistry();
    registry.push({
      id,
      name,
      codename: id,
      mode: 'external',
      path: resolvedSource,
      description,
    });
    await saveRegistry(registry);

    const stats = await getProjectStats(resolvedSource);

    return {
      id,
      path: resolvedSource,
      config: { ...projectConfig, name, description },
      stats,
      readiness: { authored: 0, approved: 0 },
    };
  }

  // Copy into workspace as local project
  const fsEntries = await readdir(config.workspaceRoot, { withFileTypes: true });
  const existing = fsEntries
    .filter((e) => e.isDirectory() && /^\d{3}_/.test(e.name))
    .map((e) => parseInt(e.name.substring(0, 3), 10));

  const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  const dirName = `${String(nextNum).padStart(3, '0')}_${codename}`;
  const projectPath = join(config.workspaceRoot, dirName);

  await cp(resolvedSource, projectPath, { recursive: true });

  // Create minimal config if missing
  const configDir = join(projectPath, 'config');
  await mkdir(configDir, { recursive: true });
  const configPath = join(configDir, 'project.yaml');
  try {
    await stat(configPath);
  } catch {
    await writeFile(configPath, `name: "${name}"\ncodename: "${codename}"\ndescription: "${description || ''}"\nlifecycle: planning\n`, 'utf-8');
  }

  // Add to registry
  const registry = await loadRegistry();
  registry.push({
    id: dirName,
    name,
    codename,
    mode: 'local',
    path: dirName,
    description,
  });
  await saveRegistry(registry);

  return {
    id: dirName,
    path: projectPath,
    config: { name, codename, description, lifecycle: 'planning' },
    stats: { bc: 0, sol: 0, us: 0, cmp: 0, fn: 0, inf: 0, adr: 0, ntf: 0, conv: 0, fbk: 0 },
    readiness: { authored: 0, approved: 0 },
  };
}

/* ------------------------------------------------------------------ */
/*  Update project metadata                                            */
/* ------------------------------------------------------------------ */

/**
 * Update project metadata in project.yaml.
 */
export async function updateProjectMeta(
  projectId: string,
  meta: Partial<ProjectConfig>
): Promise<ProjectConfig> {
  const projectPath = await resolveProjectById(projectId);
  const configPath = join(projectPath, 'config', 'project.yaml');
  const content = await readFile(configPath, 'utf-8');
  const current = normalizeProjectConfig(parseYaml(content));

  const updated = { ...current, ...meta };
  const yamlLines: string[] = [];
  for (const [key, value] of Object.entries(updated)) {
    if (typeof value === 'string') {
      yamlLines.push(`${key}: "${value}"`);
    } else if (Array.isArray(value)) {
      yamlLines.push(`${key}:`);
      for (const item of value) {
        yamlLines.push(`  - "${item}"`);
      }
    } else if (typeof value === 'object' && value !== null) {
      yamlLines.push(`${key}:`);
      for (const [k, v] of Object.entries(value)) {
        yamlLines.push(`  ${k}: "${v}"`);
      }
    }
  }
  await writeFile(configPath, yamlLines.join('\n') + '\n', 'utf-8');

  return updated;
}

/**
 * Rename a project.
 */
export async function renameProject(
  projectId: string,
  newName: string
): Promise<ProjectConfig> {
  return updateProjectMeta(projectId, { name: newName });
}

/* ------------------------------------------------------------------ */
/*  Lifecycle                                                          */
/* ------------------------------------------------------------------ */

const LIFECYCLE_STAGES: LifecycleStage[] = ['planning', 'ready', 'building', 'built', 'running', 'deployed'];

/**
 * Get the current lifecycle stage of a project.
 */
export async function getLifecycle(projectId: string): Promise<string> {
  const projectPath = await resolveProjectById(projectId);
  const configPath = join(projectPath, 'config', 'project.yaml');
  const content = await readFile(configPath, 'utf-8');
  const projectConfig = normalizeProjectConfig(parseYaml(content));
  return projectConfig.lifecycle || 'planning';
}

/**
 * Set the lifecycle stage of a project.
 */
export async function setLifecycle(projectId: string, stage: LifecycleStage): Promise<void> {
  if (!LIFECYCLE_STAGES.includes(stage)) {
    const err = new Error(`Invalid lifecycle stage "${stage}". Must be one of: ${LIFECYCLE_STAGES.join(', ')}`) as Error & { status: number };
    err.status = 400;
    throw err;
  }

  await updateProjectMeta(projectId, { lifecycle: stage });
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Resolve the absolute path for a project by ID.
 * Checks registry first, falls back to workspace root.
 */
export async function resolveProjectById(projectId: string): Promise<string> {
  const registry = await loadRegistry();
  const entry = registry.find((e) => e.id === projectId);

  if (entry) {
    return resolveProjectPath(entry);
  }

  // Fallback: assume local directory
  return join(config.workspaceRoot, projectId);
}

/**
 * Count requirement artifacts in a project.
 */
async function getProjectStats(projectPath: string): Promise<ProjectStats> {
  const stats: ProjectStats = { bc: 0, sol: 0, us: 0, cmp: 0, fn: 0, inf: 0, adr: 0, ntf: 0, conv: 0, fbk: 0 };

  const dirs: [keyof ProjectStats, string][] = [
    ['sol', 'requirements/solutions'],
    ['us', 'requirements/user-stories'],
    ['cmp', 'requirements/components'],
    ['fn', 'requirements/functions'],
    ['inf', 'requirements/infrastructure'],
    ['adr', 'requirements/adrs'],
    ['ntf', 'requirements/notifications'],
    ['conv', 'requirements/conversations'],
    ['fbk', 'requirements/feedback'],
  ];

  // Check BC
  try {
    await stat(join(projectPath, 'requirements', '00_BUSINESS_CASE.md'));
    stats.bc = 1;
  } catch {
    // No BC
  }

  for (const [key, dirRelPath] of dirs) {
    try {
      const dirPath = join(projectPath, dirRelPath);
      const files = await readdir(dirPath);
      stats[key] = files.filter((f) => f.endsWith('.md') && !f.startsWith('_')).length;
    } catch {
      // Directory doesn't exist
    }
  }

  return stats;
}

/* ------------------------------------------------------------------ */
/*  Registry API (for routes)                                          */
/* ------------------------------------------------------------------ */

/**
 * Get the projects registry entries.
 */
export async function getRegistry(): Promise<ProjectRegistryEntry[]> {
  return loadRegistry();
}

/**
 * Update a registry entry (e.g., change mode from local to external).
 */
export async function updateRegistryEntry(
  projectId: string,
  updates: Partial<ProjectRegistryEntry>
): Promise<ProjectRegistryEntry | null> {
  const registry = await loadRegistry();
  const index = registry.findIndex((e) => e.id === projectId);
  if (index === -1) return null;

  registry[index] = { ...registry[index]!, ...updates };
  await saveRegistry(registry);
  return registry[index]!;
}
