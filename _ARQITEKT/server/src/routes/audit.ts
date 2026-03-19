import { Router } from 'express';
import { getAuditLog } from '../services/audit.js';

export const auditRouter = Router();

// GET /api/projects/:id/audit
auditRouter.get('/:id/audit', async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const result = await getAuditLog(projectId, limit, offset);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
