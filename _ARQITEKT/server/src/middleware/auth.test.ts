import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth, optionalAuth } from './auth.js';

/* ------------------------------------------------------------------ */
/*  Helper: mock Express req / res / next                              */
/* ------------------------------------------------------------------ */

const mockReq = (cookies: Record<string, string> = {}) =>
  ({ cookies }) as unknown as Request;

const mockRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  return res;
};

const mockNext = () => vi.fn() as NextFunction;

/* ------------------------------------------------------------------ */
/*  requireAuth — authEnabled=false (default in local dev)             */
/* ------------------------------------------------------------------ */

describe('requireAuth (authEnabled=false)', () => {
  it('calls next() immediately when auth is disabled', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not return 401 when auth is disabled', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('does not require a cookie when auth is disabled', () => {
    const req = mockReq({}); // no cookies
    const res = mockRes();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

/* ------------------------------------------------------------------ */
/*  optionalAuth — authEnabled=false (default in local dev)            */
/* ------------------------------------------------------------------ */

describe('optionalAuth (authEnabled=false)', () => {
  it('calls next() immediately when auth is disabled', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not populate req.user when auth is disabled', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    optionalAuth(req, res, next);

    expect(req.user).toBeUndefined();
  });

  it('does not call res.status when auth is disabled', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    optionalAuth(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
  });
});
