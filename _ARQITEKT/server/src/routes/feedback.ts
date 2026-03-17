import { Router } from 'express';
import { listFeedback, createFeedback, deleteFeedback } from '../services/feedback.js';
import { validate, createFeedbackSchema } from '../middleware/validation.js';

export const feedbackRouter = Router();

// GET /api/projects/:id/feedback
feedbackRouter.get('/:id/feedback', async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const items = await listFeedback(projectId);
    res.json({ items, projectId });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/feedback
feedbackRouter.post('/:id/feedback', validate(createFeedbackSchema), async (req, res, next) => {
  try {
    const item = await createFeedback(req.params.id as string, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id/feedback/:fbkId
feedbackRouter.delete('/:id/feedback/:fbkId', async (req, res, next) => {
  try {
    await deleteFeedback(req.params.id as string, req.params.fbkId as string);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
