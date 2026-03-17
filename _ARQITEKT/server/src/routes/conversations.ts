import { Router } from 'express';
import { listConversations, saveConversation, readConversation } from '../services/conversations.js';
import { validate, saveConversationSchema } from '../middleware/validation.js';

export const conversationsRouter = Router();

// GET /api/projects/:id/conversations
conversationsRouter.get('/:id/conversations', async (req, res, next) => {
  try {
    const conversations = await listConversations(req.params.id as string);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/conversations
conversationsRouter.post('/:id/conversations', validate(saveConversationSchema), async (req, res, next) => {
  try {
    const { title, messages } = req.body;
    const conversation = await saveConversation(req.params.id as string, { title, messages });
    res.status(201).json(conversation);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/conversations/:convId
conversationsRouter.get('/:id/conversations/:convId', async (req, res, next) => {
  try {
    const conversation = await readConversation(req.params.id as string, req.params.convId as string);
    res.json(conversation);
  } catch (err) {
    next(err);
  }
});
