import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./projects.js', () => ({
  resolveProjectById: vi.fn().mockResolvedValue('/mock/project'),
}));

vi.mock('./logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { importRequirementsCsv } from './importService.js';
import { writeFile } from 'fs/promises';

describe('importRequirementsCsv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses simple CSV and creates markdown files', async () => {
    const csv = `type,id,title,status,parent,description
solution,SOL-001,Login Feature,draft,BC-001,Handle user login
us,US-001,As a user I can log in,idea,SOL-001,Login flow`;

    const result = await importRequirementsCsv('proj-1', csv);

    expect(result.totalRows).toBe(2);
    expect(result.filesCreated.length).toBe(2);
    expect(result.errors).toHaveLength(0);
    expect(result.success).toBe(true);

    const calls = (writeFile as any).mock.calls;
    expect(calls.length).toBe(2);

    // First call: SOL-001 content
    const content0 = calls[0][1] as string;
    expect(content0).toContain('id: "SOL-001"');
    expect(content0).toContain('title: "Login Feature"');
    expect(content0).toContain('parent: "BC-001"');

    // First call: path should include "solutions"
    const path0 = calls[0][0] as string;
    expect(path0).toContain('solutions');

    // Second call: US-001 content
    const content1 = calls[1][1] as string;
    expect(content1).toContain('id: "US-001"');

    // Second call: path should include "user-stories"
    const path1 = calls[1][0] as string;
    expect(path1).toContain('user-stories');
  });

  it('handles quoted CSV fields', async () => {
    const csv = `type,id,title,status,parent,description
solution,SOL-002,"Feature with, commas",draft,BC-001,"A ""quoted"" description"`;

    const result = await importRequirementsCsv('proj-1', csv);

    expect(result.totalRows).toBe(1);
    expect(result.success).toBe(true);

    const content = (writeFile as any).mock.calls[0][1] as string;
    expect(content).toContain('Feature with, commas');
  });

  it('reports errors for rows with missing required fields', async () => {
    const csv = `type,id,title
,SOL-003,No type
solution,,No id`;

    const result = await importRequirementsCsv('proj-1', csv);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.filesCreated.length).toBe(0);
  });

  it('returns success=false when CSV has only a header', async () => {
    const csv = 'type,id,title';

    const result = await importRequirementsCsv('proj-1', csv);

    expect(result.totalRows).toBe(0);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.filesCreated).toHaveLength(0);
  });
});
