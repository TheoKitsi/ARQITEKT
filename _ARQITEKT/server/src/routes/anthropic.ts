import { Router } from 'express';
import { getAnthropicStatus, connectAnthropic, disconnectAnthropic } from '../services/anthropic.js';
import { validate, connectAnthropicSchema } from '../middleware/validation.js';

export const anthropicRouter = Router();

// GET /api/anthropic/status
anthropicRouter.get('/status', async (_req, res, next) => {
  try {
    const { apiKey: _key, ...status } = await getAnthropicStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
});

// POST /api/anthropic/connect
anthropicRouter.post('/connect', validate(connectAnthropicSchema), async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    const { apiKey: _key, ...status } = await connectAnthropic(apiKey);
    res.json(status);
  } catch (err) {
    next(err);
  }
});

// POST /api/anthropic/disconnect
anthropicRouter.post('/disconnect', async (_req, res, next) => {
  try {
    await disconnectAnthropic();
    res.json({ connected: false });
  } catch (err) {
    next(err);
  }
});
