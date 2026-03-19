import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockGetRegistry = vi.fn();

vi.mock('../config.js', () => ({
  config: { authEnabled: true },
}));

vi.mock('../services/projects.js', () => ({
  getRegistry: () => mockGetRegistry(),
}));

import { requireRole } from './rbac.js';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mockReq(overrides: Partial<Request> & Record<string, unknown> = {}): Request {
  return {
    params: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  return res;
}

function mockNext(): NextFunction {
  return vi.fn() as NextFunction;
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('requireRole middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const middleware = requireRole('viewer');
    const req = mockReq({ params: { id: 'proj1' } as any });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 404 when project is not found', async () => {
    mockGetRegistry.mockResolvedValue([]);
    const middleware = requireRole('viewer');
    const req = mockReq({
      params: { id: 'unknown' } as any,
      user: { sub: 'u1', username: 'alice' },
    });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('passes through when project has no members (backwards-compat)', async () => {
    mockGetRegistry.mockResolvedValue([
      { id: 'proj1', name: 'Test', codename: 'test', mode: 'local', path: '/test' },
    ]);
    const middleware = requireRole('editor');
    const req = mockReq({
      params: { id: 'proj1' } as any,
      user: { sub: 'u1', username: 'alice' },
    });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 403 when user is not a member', async () => {
    mockGetRegistry.mockResolvedValue([
      {
        id: 'proj1', name: 'Test', codename: 'test', mode: 'local', path: '/test',
        members: [{ userId: 'u2', username: 'bob', role: 'owner', addedAt: '' }],
      },
    ]);
    const middleware = requireRole('viewer');
    const req = mockReq({
      params: { id: 'proj1' } as any,
      user: { sub: 'u1', username: 'alice' },
    });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('not a member') }));
  });

  it('returns 403 when role is insufficient', async () => {
    mockGetRegistry.mockResolvedValue([
      {
        id: 'proj1', name: 'Test', codename: 'test', mode: 'local', path: '/test',
        members: [{ userId: 'u1', username: 'alice', role: 'viewer', addedAt: '' }],
      },
    ]);
    const middleware = requireRole('editor');
    const req = mockReq({
      params: { id: 'proj1' } as any,
      user: { sub: 'u1', username: 'alice' },
    });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('editor') }));
  });

  it('passes when user has exact required role', async () => {
    mockGetRegistry.mockResolvedValue([
      {
        id: 'proj1', name: 'Test', codename: 'test', mode: 'local', path: '/test',
        members: [{ userId: 'u1', username: 'alice', role: 'editor', addedAt: '' }],
      },
    ]);
    const middleware = requireRole('editor');
    const req = mockReq({
      params: { id: 'proj1' } as any,
      user: { sub: 'u1', username: 'alice' },
    });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('passes when user has higher role than required', async () => {
    mockGetRegistry.mockResolvedValue([
      {
        id: 'proj1', name: 'Test', codename: 'test', mode: 'local', path: '/test',
        members: [{ userId: 'u1', username: 'alice', role: 'owner', addedAt: '' }],
      },
    ]);
    const middleware = requireRole('viewer');
    const req = mockReq({
      params: { id: 'proj1' } as any,
      user: { sub: 'u1', username: 'alice' },
    });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
