import { Router } from 'express';
import { buildTree, getStats, getReadiness, validateProject, setRequirementStatus } from '../services/requirements.js';
import { validate, setStatusSchema } from '../middleware/validation.js';

export const requirementsRouter = Router();

// GET /api/projects/:id/tree
requirementsRouter.get('/:id/tree', async (req, res, next) => {
  try {
    const tree = await buildTree(req.params.id as string);
    res.json(tree);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/stats
requirementsRouter.get('/:id/stats', async (req, res, next) => {
  try {
    const stats = await getStats(req.params.id as string);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/readiness
requirementsRouter.get('/:id/readiness', async (req, res, next) => {
  try {
    const readiness = await getReadiness(req.params.id as string);
    res.json(readiness);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/validate
requirementsRouter.post('/:id/validate', async (req, res, next) => {
  try {
    const results = await validateProject(req.params.id as string);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id/set-status
requirementsRouter.put('/:id/set-status', validate(setStatusSchema), async (req, res, next) => {
  try {
    const { artifactId, status } = req.body;
    await setRequirementStatus(req.params.id as string, artifactId, status);
    res.json({ success: true, artifactId, status });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/search
requirementsRouter.get('/:id/search', async (req, res, next) => {
  try {
    const query = req.query.q as string;
    const tree = await buildTree(req.params.id as string);
    const results: Array<{ id: string; title: string; type: string }> = [];

    function search(nodes: Awaited<ReturnType<typeof buildTree>>) {
      for (const node of nodes) {
        if (
          node.title.toLowerCase().includes(query.toLowerCase()) ||
          node.id.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push({ id: node.id, title: node.title, type: node.type });
        }
        search(node.children);
      }
    }

    search(tree);
    res.json({ results, query });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/next-sol-id
requirementsRouter.get('/:id/next-sol-id', async (req, res, next) => {
  try {
    const tree = await buildTree(req.params.id as string);
    const bc = tree.find((n) => n.type === 'BC');
    const solCount = bc?.children.length ?? 0;
    res.json({ id: `SOL-${solCount + 1}` });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/next-us-id
requirementsRouter.get('/:id/next-us-id', async (req, res, next) => {
  try {
    const sol = req.query.sol as string;
    const tree = await buildTree(req.params.id as string);
    const bc = tree.find((n) => n.type === 'BC');
    const solNode = bc?.children.find((s) => s.id === sol);
    const usCount = solNode?.children.length ?? 0;
    res.json({ id: `US-${sol}.${usCount + 1}` });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/bc-summary
requirementsRouter.get('/:id/bc-summary', async (req, res, next) => {
  try {
    const tree = await buildTree(req.params.id as string);
    const stats = await getStats(req.params.id as string);
    const readiness = await getReadiness(req.params.id as string);

    res.json({
      totalSolutions: stats.sol,
      totalUserStories: stats.us,
      totalComponents: stats.cmp,
      totalFunctions: stats.fn,
      readiness: readiness.authored,
      tree,
    });
  } catch (err) {
    next(err);
  }
});
