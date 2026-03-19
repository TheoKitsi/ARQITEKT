import { Router } from 'express';
import { validate, evaluateGateSchema, overrideGateSchema } from '../middleware/validation.js';
import { evaluateGate, getProjectPipeline, overrideGate, getAllGaps } from '../services/pipeline.js';
import { evaluateConfidence, evaluateAllConfidence } from '../services/confidence.js';
import type { GateId } from '../types/project.js';

export const pipelineRouter = Router();

const VALID_GATES = new Set([
  'G0_IDEA_TO_BC', 'G1_BC_TO_SOL', 'G2_SOL_TO_US',
  'G3_US_TO_CMP', 'G4_CMP_TO_FN', 'G5_FN_TO_CODE',
]);

/* ------------------------------------------------------------------ */
/*  Pipeline overview                                                  */
/* ------------------------------------------------------------------ */

// GET /api/projects/:id/pipeline
pipelineRouter.get('/:id/pipeline', async (req, res, next) => {
  try {
    const pipeline = await getProjectPipeline(req.params.id);
    res.json(pipeline);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Gate evaluation                                                    */
/* ------------------------------------------------------------------ */

// POST /api/projects/:id/pipeline/gate/:gateId
pipelineRouter.post('/:id/pipeline/gate/:gateId', validate(evaluateGateSchema), async (req, res, next) => {
  try {
    const gateId = req.params.gateId as string;
    const projectId = req.params.id as string;
    if (!VALID_GATES.has(gateId)) {
      res.status(400).json({ error: `Invalid gate: ${gateId}` });
      return;
    }
    const result = await evaluateGate(projectId, gateId as GateId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Gate override                                                      */
/* ------------------------------------------------------------------ */

// POST /api/projects/:id/pipeline/gate/:gateId/override
pipelineRouter.post('/:id/pipeline/gate/:gateId/override', validate(overrideGateSchema), async (req, res, next) => {
  try {
    const gateId = req.params.gateId as string;
    const projectId = req.params.id as string;
    if (!VALID_GATES.has(gateId)) {
      res.status(400).json({ error: `Invalid gate: ${gateId}` });
      return;
    }
    const result = await overrideGate(projectId, gateId as GateId, req.body.reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Confidence scores                                                  */
/* ------------------------------------------------------------------ */

// GET /api/projects/:id/pipeline/confidence
pipelineRouter.get('/:id/pipeline/confidence', async (req, res, next) => {
  try {
    const scores = await evaluateAllConfidence(req.params.id);
    res.json({ scores });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/pipeline/confidence/:artifactId
pipelineRouter.post('/:id/pipeline/confidence/:artifactId', async (req, res, next) => {
  try {
    const score = await evaluateConfidence(req.params.id, req.params.artifactId);
    res.json(score);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Gaps                                                               */
/* ------------------------------------------------------------------ */

// GET /api/projects/:id/pipeline/gaps
pipelineRouter.get('/:id/pipeline/gaps', async (req, res, next) => {
  try {
    const gaps = await getAllGaps(req.params.id);
    res.json({ gaps });
  } catch (err) {
    next(err);
  }
});
