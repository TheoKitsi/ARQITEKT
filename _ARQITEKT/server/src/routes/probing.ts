import { Router } from 'express';
import { validate, analyzeGapsSchema, answerQuestionSchema, skipQuestionSchema } from '../middleware/validation.js';
import { startProbing, analyzeGaps, processAnswer, processSkip } from '../services/probing.js';
import { requireRole } from '../middleware/rbac.js';
import type { ProbingQuestion } from '../types/project.js';

export const probingRouter = Router();

/**
 * In-memory probing session store.
 * Phase 3 will migrate to persistent storage.
 */
const sessions = new Map<string, ProbingQuestion[]>();

function sessionKey(projectId: string, artifactId: string): string {
  return `${projectId}::${artifactId}`;
}

/* ------------------------------------------------------------------ */
/*  Start probing analysis                                             */
/* ------------------------------------------------------------------ */

// POST /api/projects/:id/probing/analyze
probingRouter.post('/:id/probing/analyze', requireRole('editor'), validate(analyzeGapsSchema), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const { artifactId } = req.body;

    const questions = await startProbing(projectId, artifactId);
    sessions.set(sessionKey(projectId, artifactId), questions);

    res.json({
      projectId,
      artifactId,
      questions,
      total: questions.length,
      open: questions.filter((q) => q.status === 'open').length,
    });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Get open questions                                                 */
/* ------------------------------------------------------------------ */

// GET /api/projects/:id/probing/questions?artifactId=xxx
probingRouter.get('/:id/probing/questions', async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const artifactId = req.query.artifactId as string | undefined;

    if (artifactId) {
      const key = sessionKey(projectId, artifactId);
      const questions = sessions.get(key) ?? [];
      res.json({
        questions,
        total: questions.length,
        open: questions.filter((q) => q.status === 'open').length,
        answered: questions.filter((q) => q.status === 'answered').length,
        skipped: questions.filter((q) => q.status === 'skipped').length,
      });
    } else {
      // All open questions across all artifacts in this project
      const allQuestions: ProbingQuestion[] = [];
      for (const [key, qs] of sessions.entries()) {
        if (key.startsWith(`${projectId}::`)) {
          allQuestions.push(...qs.filter((q) => q.status === 'open'));
        }
      }
      res.json({
        questions: allQuestions,
        total: allQuestions.length,
      });
    }
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Answer a question                                                  */
/* ------------------------------------------------------------------ */

// POST /api/projects/:id/probing/answer
probingRouter.post('/:id/probing/answer', validate(answerQuestionSchema), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const { questionId, artifactId, answer } = req.body;

    const key = sessionKey(projectId, artifactId);
    const questions = sessions.get(key);
    if (!questions) {
      res.status(404).json({ error: 'No probing session found for this artifact' });
      return;
    }

    const idx = questions.findIndex((q) => q.id === questionId);
    if (idx === -1) {
      res.status(404).json({ error: `Question ${questionId} not found` });
      return;
    }

    const question = questions[idx];
    if (!question) {
      res.status(404).json({ error: `Question at index ${idx} not found` });
      return;
    }

    questions[idx] = processAnswer(question, answer);
    sessions.set(key, questions);

    res.json({
      question: questions[idx],
      remaining: questions.filter((q) => q.status === 'open').length,
    });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Skip a question                                                    */
/* ------------------------------------------------------------------ */

// POST /api/projects/:id/probing/skip
probingRouter.post('/:id/probing/skip', validate(skipQuestionSchema), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const { questionId, artifactId, reason } = req.body;

    const key = sessionKey(projectId, artifactId);
    const questions = sessions.get(key);
    if (!questions) {
      res.status(404).json({ error: 'No probing session found for this artifact' });
      return;
    }

    const idx = questions.findIndex((q) => q.id === questionId);
    if (idx === -1) {
      res.status(404).json({ error: `Question ${questionId} not found` });
      return;
    }

    const question = questions[idx];
    if (!question) {
      res.status(404).json({ error: `Question at index ${idx} not found` });
      return;
    }

    questions[idx] = processSkip(question, reason);
    sessions.set(key, questions);

    res.json({
      question: questions[idx],
      remaining: questions.filter((q) => q.status === 'open').length,
    });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Get raw gaps (without generating questions)                        */
/* ------------------------------------------------------------------ */

// POST /api/projects/:id/probing/gaps
probingRouter.post('/:id/probing/gaps', requireRole('editor'), validate(analyzeGapsSchema), async (req, res, next) => {
  try {
    const projectId = req.params.id as string;
    const { artifactId } = req.body;
    const gaps = await analyzeGaps(projectId, artifactId);
    res.json({ gaps });
  } catch (err) {
    next(err);
  }
});
