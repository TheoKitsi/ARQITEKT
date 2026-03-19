import { Router } from 'express';
import { sendChatMessage, listModels, getLLMConfig } from '../services/llm.js';
import { validate, chatSendSchema } from '../middleware/validation.js';
import { getProjectPipeline } from '../services/pipeline.js';

export const chatRouter = Router();

/**
 * Build a pipeline-aware system context for LLM conversations.
 * When a projectId is provided, includes pipeline status as context.
 */
async function buildPipelineContext(projectId?: string): Promise<string> {
  if (!projectId) return '';

  try {
    const pipeline = await getProjectPipeline(projectId);
    const gatesSummary = pipeline.gates.map((g) =>
      `${g.gateId}: ${g.status} (confidence: ${g.confidence}%, gaps: ${g.gaps.length})`
    ).join('\n');

    return `\n\n--- Pipeline Status for project ${projectId} ---\n` +
      `Overall confidence: ${pipeline.overallConfidence}%\n` +
      `Gates:\n${gatesSummary}\n` +
      `---\nConsider this pipeline context when answering questions about the project.`;
  } catch {
    return '';
  }
}

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

    // Extract projectId from context or message for pipeline awareness
    const projectIdMatch = (context ?? '').match(/project[:\s]+(\w+)/i)
      ?? message.match(/project[:\s]+(\w+)/i);
    const pipelineContext = await buildPipelineContext(projectIdMatch?.[1]);

    const systemContent = (context ?? '') + pipelineContext;

    const messages = [
      ...(systemContent
        ? [{ role: 'system' as const, content: systemContent }]
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
