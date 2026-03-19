import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('./requirements.js', () => ({
  buildTree: vi.fn(),
  validateProject: vi.fn(),
  getStats: vi.fn(),
}));
vi.mock('./confidence.js', () => ({
  evaluateAllConfidence: vi.fn(),
  averageConfidence: vi.fn(),
}));
vi.mock('../config.js', () => ({
  config: { workspaceRoot: '/mock/workspace', hubRoot: '/mock/hub' },
}));
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));
vi.mock('./yaml.js', () => ({
  parseYaml: vi.fn(),
}));

import { readFile } from 'fs/promises';
import { parseYaml } from './yaml.js';
import { buildTree, validateProject, getStats } from './requirements.js';
import { evaluateAllConfidence, averageConfidence } from './confidence.js';
import { getProjectPipeline, invalidateGateCache } from './pipeline.js';

const mockReadFile = vi.mocked(readFile);
const mockParseYaml = vi.mocked(parseYaml);
const mockBuildTree = vi.mocked(buildTree);
const mockValidate = vi.mocked(validateProject);
const mockGetStats = vi.mocked(getStats);
const mockEvalAll = vi.mocked(evaluateAllConfidence);
const mockAvgConf = vi.mocked(averageConfidence);

const GATE_DEFS = [
  { id: 'G0_IDEA_TO_BC', name: 'Idea -> BC', from: 'IDEA', to: 'BC', mandatoryChecks: ['bc_exists', 'bc_has_who', 'bc_has_what', 'bc_has_why'], agents: ['socratic'], autoPassThreshold: 90, riskLevel: 'medium' },
  { id: 'G1_BC_TO_SOL', name: 'BC -> SOL', from: 'BC', to: 'SOL', mandatoryChecks: ['sol_exists', 'sol_linked_to_bc'], agents: ['devils_advocate'], autoPassThreshold: 85, riskLevel: 'medium' },
  { id: 'G2_SOL_TO_US', name: 'SOL -> US', from: 'SOL', to: 'US', mandatoryChecks: ['us_exists', 'us_has_actor'], agents: ['constraint'], autoPassThreshold: 85, riskLevel: 'medium' },
  { id: 'G3_US_TO_CMP', name: 'US -> CMP', from: 'US', to: 'CMP', mandatoryChecks: ['cmp_exists'], agents: ['example'], autoPassThreshold: 80, riskLevel: 'high' },
  { id: 'G4_CMP_TO_FN', name: 'CMP -> FN', from: 'CMP', to: 'FN', mandatoryChecks: ['fn_exists'], agents: ['boundary'], autoPassThreshold: 80, riskLevel: 'high' },
  { id: 'G5_FN_TO_CODE', name: 'FN -> CODE', from: 'FN', to: 'CODE', mandatoryChecks: ['fn_approved'], agents: ['socratic', 'boundary'], autoPassThreshold: 95, riskLevel: 'critical' },
];

const TREE_WITH_BC_AND_SOL = [
  {
    id: 'BC-1',
    type: 'BC',
    title: 'Test BC with WHO WHAT WHY FOR WHOM sections',
    status: 'draft',
    children: [
      {
        id: 'SOL-1',
        type: 'SOL',
        title: 'Solution',
        status: 'draft',
        children: [
          {
            id: 'US-1.1',
            type: 'US',
            title: 'As a user I want to do X',
            status: 'idea',
            children: [],
          },
        ],
      },
    ],
  },
];

describe('pipeline service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateGateCache();
    mockReadFile.mockResolvedValue('mock yaml' as any);
    mockParseYaml.mockReturnValue({ gates: GATE_DEFS });
    mockBuildTree.mockResolvedValue(TREE_WITH_BC_AND_SOL as any);
    mockValidate.mockResolvedValue([]);
    mockGetStats.mockResolvedValue({
      bc: 1, sol: 1, us: 1, cmp: 0, fn: 0,
      inf: 0, adr: 0, ntf: 0, conv: 0, fbk: 0,
    } as any);
    mockEvalAll.mockResolvedValue([
      { artifactId: 'BC-1', overall: 75, structural: 80, semantic: 70, consistency: 75, boundary: 70 },
    ] as any);
    mockAvgConf.mockReturnValue({
      artifactId: 'project', overall: 75, structural: 80, semantic: 70, consistency: 75, boundary: 70,
    } as any);
  });

  describe('getProjectPipeline', () => {
    it('should return pipeline with 6 gates', async () => {
      const pipeline = await getProjectPipeline('001_SOCIAL');

      expect(pipeline.projectId).toBe('001_SOCIAL');
      expect(pipeline.gates).toHaveLength(6);

      const gateIds = pipeline.gates.map((g: any) => g.gateId);
      expect(gateIds).toContain('G0_IDEA_TO_BC');
      expect(gateIds).toContain('G1_BC_TO_SOL');
      expect(gateIds).toContain('G2_SOL_TO_US');
      expect(gateIds).toContain('G3_US_TO_CMP');
      expect(gateIds).toContain('G4_CMP_TO_FN');
      expect(gateIds).toContain('G5_FN_TO_CODE');
    });

    it('should evaluate G0 based on BC presence', async () => {
      const pipeline = await getProjectPipeline('001_SOCIAL');
      const g0 = pipeline.gates.find((g: any) => g.gateId === 'G0_IDEA_TO_BC');

      expect(g0).toBeDefined();
      // BC exists and has some content, so some checks should pass
      expect(g0!.checks.length).toBeGreaterThan(0);
    });

    it('should include confidence in pipeline', async () => {
      const pipeline = await getProjectPipeline('001_SOCIAL');
      expect(pipeline.overallConfidence).toBeDefined();
      expect(typeof pipeline.overallConfidence).toBe('number');
    });
  });
});
