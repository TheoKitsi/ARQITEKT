import type { ErrorRequestHandler } from 'express';
import { createLogger } from '../services/logger.js';

const log = createLogger('errorHandler');

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    log.error({ err, method: req.method, path: req.path, status }, message);
  } else {
    log.warn({ method: req.method, path: req.path, status }, message);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
