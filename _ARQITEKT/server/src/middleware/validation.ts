import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  Project schemas                                                    */
/* ------------------------------------------------------------------ */

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  template: z.string().max(50).optional(),
});

export const importProjectSchema = z.object({
  sourcePath: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const renameProjectSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateMetaSchema = z.object({
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    logo: z.string().max(200).optional(),
    mode: z.enum(['light', 'dark', 'auto']).optional(),
  }).optional(),
  github: z.object({
    repo: z.string().max(200).optional(),
    url: z.string().url().optional(),
  }).optional(),
});

export const lifecycleSchema = z.object({
  stage: z.enum(['planning', 'ready', 'building', 'built', 'running', 'deployed']),
});

/* ------------------------------------------------------------------ */
/*  Requirements schemas                                               */
/* ------------------------------------------------------------------ */

export const setStatusSchema = z.object({
  artifactId: z.string().min(1).max(50),
  status: z.enum(['idea', 'draft', 'review', 'approved', 'implemented']),
});

export const createBusinessCaseSchema = z.object({
  title: z.string().min(1).max(200),
});

export const createSolutionSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
  mode: z.enum(['discuss', 'direct']),
});

export const createUserStorySchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
  mode: z.enum(['discuss', 'direct']),
});

export const createComponentSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
  mode: z.enum(['discuss', 'direct']),
});

export const createFunctionSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
  mode: z.enum(['discuss', 'direct']),
});

/* ------------------------------------------------------------------ */
/*  Chat schemas                                                       */
/* ------------------------------------------------------------------ */

export const chatSendSchema = z.object({
  message: z.string().min(1).max(10000),
  model: z.string().max(100).optional(),
  context: z.string().max(5000).optional(),
});

/* ------------------------------------------------------------------ */
/*  Feedback schemas                                                   */
/* ------------------------------------------------------------------ */

export const createFeedbackSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  source: z.enum(['manual', 'gplay', 'appstore', 'inapp', 'email']).optional(),
  severity: z.enum(['wish', 'improvement', 'bug', 'critical']).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

/* ------------------------------------------------------------------ */
/*  Deploy schemas                                                     */
/* ------------------------------------------------------------------ */

export const scaffoldSchema = z.object({
  template: z.string().max(50).optional(),
  options: z.record(z.unknown()).optional(),
});

export const codegenSchema = z.object({
  model: z.string().max(100).optional(),
  scope: z.string().max(100).optional(),
  options: z.record(z.unknown()).optional(),
});

export const githubPushSchema = z.object({
  branch: z.string().max(100).optional(),
  commitMessage: z.string().max(500).optional(),
});

/* ------------------------------------------------------------------ */
/*  File schemas                                                       */
/* ------------------------------------------------------------------ */

export const writeFileSchema = z.object({
  path: z.string().min(1).max(500),
  content: z.string().max(1_000_000),
});

export const deleteFileSchema = z.object({
  path: z.string().min(1).max(500),
});

export const renameFileSchema = z.object({
  oldPath: z.string().min(1).max(500),
  newPath: z.string().min(1).max(500),
});

export const createDirSchema = z.object({
  path: z.string().min(1).max(500),
});

/* ------------------------------------------------------------------ */
/*  GitHub schemas                                                     */
/* ------------------------------------------------------------------ */

export const connectGithubSchema = z.object({
  token: z.string().min(1).max(200),
});

/* ------------------------------------------------------------------ */
/*  Conversation schemas                                               */
/* ------------------------------------------------------------------ */

export const saveConversationSchema = z.object({
  title: z.string().min(1).max(200),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(50000),
  })).min(1).max(500),
});

/* ------------------------------------------------------------------ */
/*  Registry schemas                                                    */
/* ------------------------------------------------------------------ */

export const updateRegistryEntrySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  codename: z.string().min(1).max(50).optional(),
  mode: z.enum(['local', 'external']).optional(),
  path: z.string().min(1).max(500).optional(),
  github: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

/* ------------------------------------------------------------------ */
/*  Member & invite schemas                                            */
/* ------------------------------------------------------------------ */

export const addMemberSchema = z.object({
  userId: z.string().min(1).max(100),
  username: z.string().min(1).max(100),
  role: z.enum(['owner', 'editor', 'viewer']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['owner', 'editor', 'viewer']),
});

export const createInviteSchema = z.object({
  role: z.enum(['owner', 'editor', 'viewer']),
});

/* ------------------------------------------------------------------ */
/*  Export schemas                                                     */
/* ------------------------------------------------------------------ */

export const githubExportSchema = z.object({
  format: z.enum(['github', 'json', 'csv']).optional(),
});

/* ------------------------------------------------------------------ */
/*  Validation middleware                                               */
/* ------------------------------------------------------------------ */

import type { Request, Response, NextFunction } from 'express';

/**
 * Express middleware factory: validates req.body against a zod schema.
 */
export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Express middleware factory: validates req.query against a zod schema.
 */
export function validateQuery(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: 'Query validation failed',
        details: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }
    next();
  };
}

/* ------------------------------------------------------------------ */
/*  Pipeline schemas                                                   */
/* ------------------------------------------------------------------ */

export const evaluateGateSchema = z.object({}).strict().optional();

export const overrideGateSchema = z.object({
  reason: z.string().min(10).max(2000),
});

/* ------------------------------------------------------------------ */
/*  Probing schemas                                                    */
/* ------------------------------------------------------------------ */

export const analyzeGapsSchema = z.object({
  artifactId: z.string().min(1).max(50),
});

export const answerQuestionSchema = z.object({
  questionId: z.string().min(1).max(100),
  artifactId: z.string().min(1).max(50),
  answer: z.string().min(1).max(5000),
});

export const skipQuestionSchema = z.object({
  questionId: z.string().min(1).max(100),
  artifactId: z.string().min(1).max(50),
  reason: z.string().min(5).max(1000),
});

/* ------------------------------------------------------------------ */
/*  Query parameter schemas                                            */
/* ------------------------------------------------------------------ */

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
});

export const nextUsIdQuerySchema = z.object({
  sol: z.string().min(1).max(50),
});

export const updateContentSchema = z.object({
  content: z.string().max(51200),
  title: z.string().min(1).max(200).optional(),
});

export const artifactIdParamSchema = z.object({
  artifactId: z.string().min(1).max(50),
});
