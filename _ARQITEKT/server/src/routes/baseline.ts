import { Router } from 'express';
import { setBaseline, getBaseline, checkDrift } from '../services/baseline.js';
import { buildMatrix, findOrphans, impactAnalysis } from '../services/traceability.js';
import { recordAudit } from '../services/audit.js';
import { requireRole } from '../middleware/rbac.js';

export const baselineRouter = Router();

/* ------------------------------------------------------------------ */
/*  Baseline                                                           */
/* ------------------------------------------------------------------ */

// POST /api/projects/:id/baseline — snapshot current state
baselineRouter.post('/:id/baseline', requireRole('editor'), async (req, res, next) => {
  try {
    const baseline = await setBaseline(req.params.id as string);
    recordAudit(req.params.id as string, 'baseline.created', req.ip ?? 'unknown', undefined, { artifacts: baseline.artifacts?.length }).catch(() => {});
    res.json(baseline);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/baseline — get current baseline
baselineRouter.get('/:id/baseline', async (req, res, next) => {
  try {
    const baseline = await getBaseline(req.params.id);
    res.json(baseline ?? null);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/drift — compare current state against baseline
baselineRouter.get('/:id/drift', async (req, res, next) => {
  try {
    const drift = await checkDrift(req.params.id);
    res.json(drift);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Traceability                                                       */
/* ------------------------------------------------------------------ */

// GET /api/projects/:id/traceability — full trace matrix
baselineRouter.get('/:id/traceability', async (req, res, next) => {
  try {
    const matrix = await buildMatrix(req.params.id);
    res.json(matrix);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/traceability/orphans — unlinked artifacts
baselineRouter.get('/:id/traceability/orphans', async (req, res, next) => {
  try {
    const orphans = await findOrphans(req.params.id);
    res.json({ orphans });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/traceability/impact/:artifactId — impact analysis
baselineRouter.get('/:id/traceability/impact/:artifactId', async (req, res, next) => {
  try {
    const impact = await impactAnalysis(req.params.id, req.params.artifactId);
    res.json(impact);
  } catch (err) {
    next(err);
  }
});
