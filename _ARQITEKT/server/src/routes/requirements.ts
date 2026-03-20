import { Router } from 'express';
import { buildTree, getStats, getReadiness, validateProject, setRequirementStatus } from '../services/requirements.js';
import { getArtifactContent, updateArtifactContent } from '../services/requirementHelpers.js';
import { importRequirementsCsv } from '../services/importService.js';
import { validate, validateQuery, setStatusSchema, searchQuerySchema, nextUsIdQuerySchema, updateContentSchema, createSolutionSchema, createUserStorySchema } from '../middleware/validation.js';
import { recordAudit } from '../services/audit.js';
import { requireRole } from '../middleware/rbac.js';
import { createSolution, createUserStory } from '../services/artifactCreation.js';

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
requirementsRouter.put('/:id/set-status', requireRole('editor'), validate(setStatusSchema), async (req, res, next) => {
  try {
    const { artifactId, status } = req.body;
    await setRequirementStatus(req.params.id as string, artifactId, status);
    // Audit: fire-and-forget
    recordAudit(req.params.id as string, 'requirement.status_changed', req.ip ?? 'unknown', artifactId, { status }).catch(() => {});
    res.json({ success: true, artifactId, status });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/search
requirementsRouter.get('/:id/search', validateQuery(searchQuerySchema), async (req, res, next) => {
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
requirementsRouter.get('/:id/next-us-id', validateQuery(nextUsIdQuerySchema), async (req, res, next) => {
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

// POST /api/projects/:id/import-csv — bulk import requirements from CSV
requirementsRouter.post('/:id/import-csv', requireRole('editor'), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const csv = req.body?.csv;
    if (!csv || typeof csv !== 'string') {
      res.status(400).json({ error: 'Missing "csv" field in request body' });
      return;
    }
    const result = await importRequirementsCsv(projectId, csv);
    recordAudit(projectId, 'requirement.created', req.ip ?? 'unknown', undefined, {
      action: 'csv-import',
      imported: result.filesCreated.length,
    }).catch(() => {});
    if (!result.success) {
      res.status(207).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/requirements/:artifactId/content
requirementsRouter.get('/:id/requirements/:artifactId/content', async (req, res, next) => {
  try {
    const data = await getArtifactContent(req.params.id as string, req.params.artifactId as string);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id/requirements/:artifactId/content
requirementsRouter.put('/:id/requirements/:artifactId/content', requireRole('editor'), validate(updateContentSchema), async (req, res, next) => {
  try {
    const { content, title } = req.body;
    await updateArtifactContent(req.params.id as string, req.params.artifactId as string, content, title);
    recordAudit(req.params.id as string, 'requirement.edited', req.ip ?? 'unknown', req.params.artifactId as string, { title }).catch(() => {});
    res.json({ success: true, artifactId: req.params.artifactId });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/solutions — create a new solution
requirementsRouter.post('/:id/solutions', requireRole('editor'), validate(createSolutionSchema), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const { title, notes, mode } = req.body;
    const result = await createSolution(projectId, title, notes, mode);
    recordAudit(projectId, 'requirement.created', req.ip ?? 'unknown', result.id, { type: 'SOL', title }).catch(() => {});
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/solutions/:solId/user-stories — create a new user story under a solution
requirementsRouter.post('/:id/solutions/:solId/user-stories', requireRole('editor'), validate(createUserStorySchema), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const solutionId = req.params.solId as string;
    const { title, notes, mode } = req.body;
    const result = await createUserStory(projectId, solutionId, title, notes, mode);
    recordAudit(projectId, 'requirement.created', req.ip ?? 'unknown', result.id, { type: 'US', title }).catch(() => {});
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
