import { writeFile } from 'fs/promises';
import { join } from 'path';
import { parseFrontmatter } from './frontmatter.js';
import { resolveProjectById } from './projects.js';
import { fmString, findArtifactFile, STATUS_ORDER } from './requirementHelpers.js';
import type { RequirementStatus } from '../types/project.js';

/**
 * Set the status of a requirement artifact.
 * Validates the new status and ensures only forward transitions are allowed.
 */
export async function setRequirementStatus(
  projectId: string,
  artifactId: string,
  newStatus: RequirementStatus
): Promise<void> {
  // Validate newStatus is a valid status value
  if (!STATUS_ORDER.includes(newStatus)) {
    const err = new Error(`Invalid status "${newStatus}". Must be one of: ${STATUS_ORDER.join(', ')}`) as Error & { status: number };
    err.status = 400;
    throw err;
  }

  // Find the artifact file by searching all subdirectories of requirements/
  const reqPath = join(await resolveProjectById(projectId), 'requirements');
  const result = await findArtifactFile(reqPath, artifactId);

  if (!result) {
    const err = new Error(`Artifact "${artifactId}" not found in project "${projectId}"`) as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const { filePath, content } = result;

  // Parse current status from frontmatter
  const { data: fm } = parseFrontmatter(content);
  const currentStatus = (fmString(fm, 'status') || 'idea') as RequirementStatus;

  // Validate forward-only transition
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const newIndex = STATUS_ORDER.indexOf(newStatus);

  if (newIndex <= currentIndex) {
    const err = new Error(
      `Invalid status transition: cannot move from "${currentStatus}" to "${newStatus}". Only forward transitions are allowed: ${STATUS_ORDER.join(' → ')}`
    ) as Error & { status: number };
    err.status = 400;
    throw err;
  }

  // Replace the status line in the frontmatter
  const updatedContent = content.replace(
    /^(---\r?\n[\s\S]*?)(\nstatus:\s*).+?(\r?\n[\s\S]*?---)/m,
    `$1$2${newStatus}$3`
  );

  await writeFile(filePath, updatedContent, 'utf-8');
}
