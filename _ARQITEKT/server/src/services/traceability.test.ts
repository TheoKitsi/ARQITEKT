import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock requirements
vi.mock('./requirements.js', () => ({
  buildTree: vi.fn(),
}));

import { buildMatrix, findOrphans, impactAnalysis } from './traceability.js';
import { buildTree } from './requirements.js';

const mockBuildTree = vi.mocked(buildTree);

const SAMPLE_TREE = [
  {
    id: 'BC-1',
    type: 'BC',
    title: 'Business Case',
    status: 'draft',
    children: [
      {
        id: 'SOL-1',
        type: 'SOL',
        title: 'Solution One',
        status: 'draft',
        children: [
          {
            id: 'US-1.1',
            type: 'US',
            title: 'User Story',
            status: 'idea',
            children: [
              {
                id: 'CMP-1.1.1',
                type: 'CMP',
                title: 'Component',
                status: 'idea',
                children: [
                  {
                    id: 'FN-1.1.1.1',
                    type: 'FN',
                    title: 'Function',
                    status: 'idea',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'SOL-2',
        type: 'SOL',
        title: 'Solution Two',
        status: 'draft',
        children: [], // Leaf SOL — should be detected as incomplete
      },
    ],
  },
];

describe('traceability service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildTree.mockResolvedValue(SAMPLE_TREE as any);
  });

  describe('buildMatrix', () => {
    it('should build parent/child trace links for full hierarchy', async () => {
      const matrix = await buildMatrix('test-project');

      expect(matrix.projectId).toBe('test-project');
      expect(matrix.links.length).toBeGreaterThan(0);

      // BC-1 → SOL-1 parent link exists
      const bcToSol = matrix.links.find(
        (l) => l.from === 'BC-1' && l.to === 'SOL-1' && l.relation === 'parent',
      );
      expect(bcToSol).toBeDefined();

      // SOL-1 → BC-1 child link exists
      const solToBc = matrix.links.find(
        (l) => l.from === 'SOL-1' && l.to === 'BC-1' && l.relation === 'child',
      );
      expect(solToBc).toBeDefined();
    });

    it('should detect leaf nodes that need children', async () => {
      const matrix = await buildMatrix('test-project');

      // SOL-2 has no children — should be a leaf
      expect(matrix.leaves).toContain('SOL-2');
      // FN-1.1.1.1 has no children — but FN is expected to be a leaf, so it should NOT be listed
      expect(matrix.leaves).not.toContain('FN-1.1.1.1');
    });

    it('should not flag BC as orphan (top-level)', async () => {
      const matrix = await buildMatrix('test-project');
      expect(matrix.orphans).not.toContain('BC-1');
    });
  });

  describe('findOrphans', () => {
    it('should return orphan list from matrix', async () => {
      const orphans = await findOrphans('test-project');
      // No orphans in our well-structured tree (all non-root nodes have parents)
      expect(orphans).toHaveLength(0);
    });
  });

  describe('impactAnalysis', () => {
    it('should find direct impacts (parent + children)', async () => {
      const impact = await impactAnalysis('test-project', 'SOL-1');

      expect(impact.artifactId).toBe('SOL-1');
      // SOL-1's direct impacts: parent=BC-1, child=US-1.1
      expect(impact.directlyAffected).toContain('BC-1');
      expect(impact.directlyAffected).toContain('US-1.1');
    });

    it('should find transitive impacts (all descendants + ancestors)', async () => {
      const impact = await impactAnalysis('test-project', 'US-1.1');

      // Direct: SOL-1 (parent), CMP-1.1.1 (child)
      expect(impact.directlyAffected).toContain('SOL-1');
      expect(impact.directlyAffected).toContain('CMP-1.1.1');

      // Transitive: BC-1 (grandparent), FN-1.1.1.1 (grandchild)
      expect(impact.transitivelyAffected).toContain('BC-1');
      expect(impact.transitivelyAffected).toContain('FN-1.1.1.1');
    });

    it('should calculate total impact correctly', async () => {
      const impact = await impactAnalysis('test-project', 'SOL-1');

      expect(impact.totalImpact).toBe(
        impact.directlyAffected.length + impact.transitivelyAffected.length,
      );
    });

    it('should handle leaf node impact (no children)', async () => {
      const impact = await impactAnalysis('test-project', 'FN-1.1.1.1');

      // Only parent as direct
      expect(impact.directlyAffected).toContain('CMP-1.1.1');
      // All ancestors as transitive
      expect(impact.transitivelyAffected.length).toBeGreaterThan(0);
    });
  });
});
