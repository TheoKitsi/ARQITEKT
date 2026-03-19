import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs/promises for baseline tests
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

// Mock config
vi.mock('../config.js', () => ({
  config: { workspaceRoot: '/mock/workspace', hubRoot: '/mock/hub' },
}));

// Mock requirements
vi.mock('./requirements.js', () => ({
  buildTree: vi.fn(),
}));

import { readFile, writeFile, mkdir } from 'fs/promises';
import { setBaseline, getBaseline, checkDrift } from './baseline.js';
import { buildTree } from './requirements.js';

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockMkdir = vi.mocked(mkdir);
const mockBuildTree = vi.mocked(buildTree);

const SAMPLE_TREE = [
  {
    id: 'BC-1',
    type: 'BC',
    title: 'Test Business Case',
    status: 'draft',
    parent: undefined,
    children: [
      {
        id: 'SOL-1',
        type: 'SOL',
        title: 'Solution One',
        status: 'draft',
        parent: 'BC-1',
        children: [
          {
            id: 'US-1.1',
            type: 'US',
            title: 'User Story 1.1',
            status: 'idea',
            parent: 'SOL-1',
            children: [],
          },
        ],
      },
    ],
  },
];

describe('baseline service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildTree.mockResolvedValue(SAMPLE_TREE as any);
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
  });

  describe('setBaseline', () => {
    it('should create a baseline snapshot from the project tree', async () => {
      const baseline = await setBaseline('001_SOCIAL');

      expect(mockBuildTree).toHaveBeenCalledWith('001_SOCIAL');
      expect(mockMkdir).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalled();

      expect(baseline.projectId).toBe('001_SOCIAL');
      expect(baseline.artifacts).toHaveLength(3); // BC-1, SOL-1, US-1.1
      expect(baseline.treeHash).toBeTruthy();
      expect(baseline.createdAt).toBeTruthy();
    });

    it('should hash artifact contents consistently', async () => {
      const b1 = await setBaseline('001_SOCIAL');
      const b2 = await setBaseline('001_SOCIAL');

      // Same tree produces same hashes
      expect(b1.treeHash).toBe(b2.treeHash);
      expect(b1.artifacts[0].contentHash).toBe(b2.artifacts[0].contentHash);
    });

    it('should flatten all tree nodes into artifacts array', async () => {
      const baseline = await setBaseline('001_SOCIAL');
      const ids = baseline.artifacts.map((a: any) => a.id);

      expect(ids).toContain('BC-1');
      expect(ids).toContain('SOL-1');
      expect(ids).toContain('US-1.1');
    });
  });

  describe('getBaseline', () => {
    it('should return null when no baseline file exists', async () => {
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      const result = await getBaseline('001_SOCIAL');
      expect(result).toBeNull();
    });

    it('should return parsed baseline when file exists', async () => {
      const stored = {
        projectId: '001_SOCIAL',
        createdAt: '2026-01-01T00:00:00.000Z',
        treeHash: 'abc123',
        artifacts: [{ id: 'BC-1', type: 'BC', title: 'T', status: 'draft', contentHash: 'x' }],
      };
      mockReadFile.mockResolvedValue(JSON.stringify(stored) as any);

      const result = await getBaseline('001_SOCIAL');
      expect(result).not.toBeNull();
      expect(result!.projectId).toBe('001_SOCIAL');
      expect(result!.artifacts).toHaveLength(1);
    });
  });

  describe('checkDrift', () => {
    it('should report no drift when tree matches baseline', async () => {
      // Set baseline first
      const baseline = await setBaseline('001_SOCIAL');
      mockReadFile.mockResolvedValue(JSON.stringify(baseline) as any);

      const report = await checkDrift('001_SOCIAL');
      expect(report.changedArtifacts).toBe(0);
      expect(report.drifts).toHaveLength(0);
    });

    it('should detect added artifacts', async () => {
      const oldBaseline = {
        projectId: '001_SOCIAL',
        createdAt: '2026-01-01T00:00:00.000Z',
        treeHash: 'old',
        artifacts: [
          { id: 'BC-1', type: 'BC', title: 'Test Business Case', status: 'draft', contentHash: 'x' },
        ],
      };
      mockReadFile.mockResolvedValue(JSON.stringify(oldBaseline) as any);

      // Current tree has 3 nodes (BC-1, SOL-1, US-1.1) but baseline only had BC-1
      const report = await checkDrift('001_SOCIAL');
      expect(report.changedArtifacts).toBeGreaterThan(0);
      const addedItems = report.drifts.filter((i: any) => i.kind === 'added');
      expect(addedItems.length).toBeGreaterThanOrEqual(2); // SOL-1, US-1.1
    });

    it('should detect removed artifacts', async () => {
      const oldBaseline = {
        projectId: '001_SOCIAL',
        createdAt: '2026-01-01T00:00:00.000Z',
        treeHash: 'old',
        artifacts: [
          { id: 'BC-1', type: 'BC', title: 'Test Business Case', status: 'draft', contentHash: 'x' },
          { id: 'SOL-1', type: 'SOL', title: 'Solution One', status: 'draft', parent: 'BC-1', contentHash: 'y' },
          { id: 'US-1.1', type: 'US', title: 'User Story 1.1', status: 'idea', parent: 'SOL-1', contentHash: 'z' },
          { id: 'SOL-2', type: 'SOL', title: 'Removed Solution', status: 'draft', parent: 'BC-1', contentHash: 'w' },
        ],
      };
      mockReadFile.mockResolvedValue(JSON.stringify(oldBaseline) as any);

      const report = await checkDrift('001_SOCIAL');
      expect(report.changedArtifacts).toBeGreaterThan(0);
      const removed = report.drifts.filter((i: any) => i.kind === 'removed');
      expect(removed.some((r: any) => r.artifactId === 'SOL-2')).toBe(true);
    });

    it('should detect title changes', async () => {
      const baseline = await setBaseline('001_SOCIAL');
      // Modify title in baseline artifact
      baseline.artifacts[0].title = 'Old Title';
      mockReadFile.mockResolvedValue(JSON.stringify(baseline) as any);

      const report = await checkDrift('001_SOCIAL');
      expect(report.changedArtifacts).toBeGreaterThan(0);
      const titleChanges = report.drifts.filter((i: any) => i.kind === 'title_changed');
      expect(titleChanges.length).toBeGreaterThanOrEqual(1);
    });
  });
});
