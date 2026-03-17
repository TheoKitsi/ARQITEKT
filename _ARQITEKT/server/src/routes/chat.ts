import { Router } from 'express';
import { sendChatMessage, listModels, getLLMConfig } from '../services/llm.js';
import { validate, chatSendSchema } from '../middleware/validation.js';

export const chatRouter = Router();

// GET /api/chat/config
chatRouter.get('/config', async (_req, res, next) => {
  try {
    const cfg = getLLMConfig();
    res.json({
      configured: !!cfg.apiKey,
      model: cfg.model,
      provider: cfg.provider,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat/send
chatRouter.post('/send', validate(chatSendSchema), async (req, res, next) => {
  try {
    const { message, model, context } = req.body;
    const messages = [
      ...(context
        ? [{ role: 'system' as const, content: context }]
        : []),
      { role: 'user' as const, content: message },
    ];

    const result = await sendChatMessage(messages, model);

    res.json({
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: result.content,
      model: result.model,
      timestamp: Date.now(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/models
chatRouter.get('/models', async (_req, res, next) => {
  try {
    const models = await listModels();
    res.json(models);
  } catch (err) {
    next(err);
  }
});
