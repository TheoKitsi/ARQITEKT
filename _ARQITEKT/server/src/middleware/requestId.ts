import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
      log: typeof logger;
    }
  }
}

/**
 * Assigns a unique request ID (from X-Request-Id header or generated UUID)
 * and attaches a child pino logger with the request context.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) || randomUUID();
  req.id = id;
  req.log = logger.child({ reqId: id });
  res.setHeader('X-Request-Id', id);

  const start = Date.now();
  res.on('finish', () => {
    req.log.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms: Date.now() - start,
    }, 'request completed');
  });

  next();
}
