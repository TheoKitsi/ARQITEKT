import {
  createProjectSchema,
  chatSendSchema,
  lifecycleSchema,
  createFeedbackSchema,
  updateRegistryEntrySchema,
  validate,
} from './validation.js';

/* ------------------------------------------------------------------ */
/*  Helper: mock Express req / res / next                              */
/* ------------------------------------------------------------------ */

function mockReqResNext(body: unknown) {
  const req = { body } as any;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
  const next = vi.fn();
  return { req, res, next };
}

/* ------------------------------------------------------------------ */
/*  createProjectSchema                                                */
/* ------------------------------------------------------------------ */

describe('createProjectSchema', () => {
  it('accepts valid input', () => {
    const result = createProjectSchema.safeParse({
      name: 'My Project',
      description: 'A cool project',
    });

    expect(result.success).toBe(true);
  });

  it('accepts input without optional description', () => {
    const result = createProjectSchema.safeParse({ name: 'MinimalProject' });

    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = createProjectSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = createProjectSchema.safeParse({ name: '' });

    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = createProjectSchema.safeParse({ name: 'x'.repeat(101) });

    expect(result.success).toBe(false);
  });

  it('rejects description longer than 500 characters', () => {
    const result = createProjectSchema.safeParse({
      name: 'Test',
      description: 'x'.repeat(501),
    });

    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  lifecycleSchema                                                    */
/* ------------------------------------------------------------------ */

describe('lifecycleSchema', () => {
  it('accepts valid stages', () => {
    const validStages = ['planning', 'ready', 'building', 'built', 'running', 'deployed'];

    for (const stage of validStages) {
      const result = lifecycleSchema.safeParse({ stage });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid stage', () => {
    const result = lifecycleSchema.safeParse({ stage: 'unknown' });

    expect(result.success).toBe(false);
  });

  it('rejects missing stage', () => {
    const result = lifecycleSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  chatSendSchema                                                     */
/* ------------------------------------------------------------------ */

describe('chatSendSchema', () => {
  it('accepts valid message', () => {
    const result = chatSendSchema.safeParse({ message: 'Hello, AI!' });

    expect(result.success).toBe(true);
  });

  it('accepts message with optional model and context', () => {
    const result = chatSendSchema.safeParse({
      message: 'Generate a component',
      model: 'gpt-4',
      context: 'Project: Social',
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty message', () => {
    const result = chatSendSchema.safeParse({ message: '' });

    expect(result.success).toBe(false);
  });

  it('rejects missing message', () => {
    const result = chatSendSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('rejects message longer than 10000 characters', () => {
    const result = chatSendSchema.safeParse({ message: 'a'.repeat(10001) });

    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  createFeedbackSchema                                               */
/* ------------------------------------------------------------------ */

describe('createFeedbackSchema', () => {
  it('accepts valid feedback with all fields', () => {
    const result = createFeedbackSchema.safeParse({
      title: 'App crashes on login',
      description: 'When I tap login, the app closes immediately.',
      source: 'inapp',
      severity: 'bug',
      rating: 2,
    });

    expect(result.success).toBe(true);
  });

  it('accepts feedback with only required title', () => {
    const result = createFeedbackSchema.safeParse({ title: 'Great app!' });

    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const result = createFeedbackSchema.safeParse({
      description: 'No title provided',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid source', () => {
    const result = createFeedbackSchema.safeParse({
      title: 'Test',
      source: 'twitter',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid severity', () => {
    const result = createFeedbackSchema.safeParse({
      title: 'Test',
      severity: 'urgent',
    });

    expect(result.success).toBe(false);
  });

  it('rejects rating outside 1-5 range', () => {
    const tooLow = createFeedbackSchema.safeParse({ title: 'T', rating: 0 });
    const tooHigh = createFeedbackSchema.safeParse({ title: 'T', rating: 6 });

    expect(tooLow.success).toBe(false);
    expect(tooHigh.success).toBe(false);
  });

  it('rejects non-integer rating', () => {
    const result = createFeedbackSchema.safeParse({ title: 'Test', rating: 3.5 });

    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  updateRegistryEntrySchema                                          */
/* ------------------------------------------------------------------ */

describe('updateRegistryEntrySchema', () => {
  it('accepts partial updates', () => {
    const result = updateRegistryEntrySchema.safeParse({
      name: 'Renamed Project',
    });

    expect(result.success).toBe(true);
  });

  it('accepts all optional fields together', () => {
    const result = updateRegistryEntrySchema.safeParse({
      name: 'Social',
      codename: 'social',
      mode: 'external',
      path: '/home/user/repos/social',
      github: 'TheoKitsi/social',
      description: 'Social networking app',
    });

    expect(result.success).toBe(true);
  });

  it('accepts empty object (all fields optional)', () => {
    const result = updateRegistryEntrySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('rejects invalid mode', () => {
    const result = updateRegistryEntrySchema.safeParse({ mode: 'cloud' });

    expect(result.success).toBe(false);
  });

  it('rejects name exceeding max length', () => {
    const result = updateRegistryEntrySchema.safeParse({ name: 'x'.repeat(101) });

    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  validate middleware                                                 */
/* ------------------------------------------------------------------ */

describe('validate middleware', () => {
  it('calls next() for valid body', () => {
    const { req, res, next } = mockReqResNext({ name: 'TestProject' });
    const middleware = validate(createProjectSchema);

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('replaces req.body with parsed data', () => {
    const { req, res, next } = mockReqResNext({
      name: 'TestProject',
      unknownField: 'should be stripped',
    });
    const middleware = validate(createProjectSchema);

    middleware(req, res, next);

    expect(req.body).toEqual({ name: 'TestProject' });
    expect(req.body.unknownField).toBeUndefined();
  });

  it('returns 400 for invalid body', () => {
    const { req, res, next } = mockReqResNext({});
    const middleware = validate(createProjectSchema);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
          }),
        ]),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns details with path information', () => {
    const { req, res, next } = mockReqResNext({ name: '' });
    const middleware = validate(createProjectSchema);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.any(String),
          message: expect.any(String),
        }),
      ]),
    );
  });

  it('works with different schemas', () => {
    const { req, res, next } = mockReqResNext({ stage: 'planning' });
    const middleware = validate(lifecycleSchema);

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({ stage: 'planning' });
  });

  it('does not call next when validation fails', () => {
    const { req, res, next } = mockReqResNext({ message: '' });
    const middleware = validate(chatSendSchema);

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
