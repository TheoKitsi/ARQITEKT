import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./projects.js', () => ({
  resolveProjectById: vi.fn().mockResolvedValue('/mock/project'),
}));

vi.mock('./requirementHelpers.js', async () => {
  const helpers = await vi.importActual<typeof import('./requirementHelpers.js')>('./requirementHelpers.js');
  return {
    ...helpers,
    findArtifactFile: vi.fn(),
  };
});

vi.mock('./frontmatter.js', async () => {
  const actual = await vi.importActual<typeof import('./frontmatter.js')>('./frontmatter.js');
  return { ...actual };
});

vi.mock('./logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { setRequirementStatus } from './status.js';
import { findArtifactFile } from './requirementHelpers.js';
import { writeFile } from 'fs/promises';

describe('setRequirementStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws 400 for invalid status value', async () => {
    await expect(
      setRequirementStatus('p1', 'SOL-001', 'banana' as any),
    ).rejects.toThrow('Invalid status');
  });

  it('throws 404 when artifact not found', async () => {
    (findArtifactFile as any).mockResolvedValue(null);

    await expect(
      setRequirementStatus('p1', 'SOL-999', 'draft'),
    ).rejects.toThrow('not found');
  });

  it('throws 400 for backward transition', async () => {
    const content = `---\ntype: Solution\nid: "SOL-001"\ntitle: "Test"\nstatus: review\n---\nBody`;
    (findArtifactFile as any).mockResolvedValue({ filePath: '/mock/project/requirements/solutions/SOL-001.md', content });

    await expect(
      setRequirementStatus('p1', 'SOL-001', 'draft'),
    ).rejects.toThrow('Only forward transitions');
  });

  it('throws 400 for same-status transition', async () => {
    const content = `---\ntype: Solution\nid: "SOL-001"\ntitle: "Test"\nstatus: draft\n---\nBody`;
    (findArtifactFile as any).mockResolvedValue({ filePath: '/mock/project/requirements/solutions/SOL-001.md', content });

    await expect(
      setRequirementStatus('p1', 'SOL-001', 'draft'),
    ).rejects.toThrow('Only forward transitions');
  });

  it('writes updated status for valid forward transition', async () => {
    const content = `---\ntype: Solution\nid: "SOL-001"\ntitle: "Test"\nstatus: draft\n---\nBody`;
    (findArtifactFile as any).mockResolvedValue({ filePath: '/mock/file.md', content });

    await setRequirementStatus('p1', 'SOL-001', 'review');

    expect(writeFile).toHaveBeenCalledTimes(1);
    const writtenContent = (writeFile as any).mock.calls[0][1] as string;
    expect(writtenContent).toContain('status: review');
    expect(writtenContent).not.toContain('status: draft');
  });
});
