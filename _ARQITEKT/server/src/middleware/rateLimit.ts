import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for AI/LLM proxy endpoints.
 * 20 requests per minute per IP.
 */
export const aiRateLimit = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests, please try again later' },
});

/**
 * General API rate limiter.
 * 200 requests per minute per IP.
 */
export const apiRateLimit = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
