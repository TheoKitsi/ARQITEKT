import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { verifyToken } from '../services/auth.js';
import type { JwtPayload } from '../types/auth.js';

// Extend Express Request with user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT authentication middleware.
 * When AUTH_ENABLED=false (default), all requests pass through.
 * When AUTH_ENABLED=true, requires valid JWT in HTTP-only cookie.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!config.authEnabled) {
    return next();
  }

  const token = req.cookies?.arqitekt_token as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth: populates req.user if token present, but does not reject.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!config.authEnabled) {
    return next();
  }

  const token = req.cookies?.arqitekt_token as string | undefined;
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Invalid token — continue without user
    }
  }
  next();
}
