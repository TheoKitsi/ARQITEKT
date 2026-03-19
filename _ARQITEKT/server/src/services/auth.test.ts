import { describe, it, expect } from 'vitest';
import { signTokens, verifyToken } from './auth.js';
import type { UserProfile } from '../types/auth.js';

/* ------------------------------------------------------------------ */
/*  Helper: sample user profile                                        */
/* ------------------------------------------------------------------ */

const sampleUser: UserProfile = {
  id: '12345',
  username: 'theotest',
  displayName: 'Theo Test',
  avatarUrl: 'https://example.com/avatar.png',
  email: 'theo@example.com',
};

/* ------------------------------------------------------------------ */
/*  signTokens + verifyToken                                           */
/* ------------------------------------------------------------------ */

describe('signTokens', () => {
  it('returns an object with token and refreshToken', () => {
    const result = signTokens(sampleUser);

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('refreshToken');
    expect(typeof result.token).toBe('string');
    expect(typeof result.refreshToken).toBe('string');
  });

  it('generates different access and refresh tokens', () => {
    const result = signTokens(sampleUser);

    expect(result.token).not.toBe(result.refreshToken);
  });
});

describe('verifyToken', () => {
  it('decodes a valid token signed by signTokens', () => {
    const { token } = signTokens(sampleUser);
    const payload = verifyToken(token);

    expect(payload.sub).toBe(sampleUser.id);
    expect(payload.username).toBe(sampleUser.username);
  });

  it('returns payload with sub and username matching the user', () => {
    const { token } = signTokens(sampleUser);
    const payload = verifyToken(token);

    expect(payload).toMatchObject({
      sub: '12345',
      username: 'theotest',
    });
  });

  it('returns payload with iat and exp fields', () => {
    const { token } = signTokens(sampleUser);
    const payload = verifyToken(token);

    expect(payload.iat).toEqual(expect.any(Number));
    expect(payload.exp).toEqual(expect.any(Number));
    expect(payload.exp!).toBeGreaterThan(payload.iat!);
  });

  it('throws on an invalid token string', () => {
    expect(() => verifyToken('this.is.not-a-valid-token')).toThrow();
  });

  it('throws on an empty string', () => {
    expect(() => verifyToken('')).toThrow();
  });

  it('can also verify the refresh token', () => {
    const { refreshToken } = signTokens(sampleUser);
    const payload = verifyToken(refreshToken);

    expect(payload.sub).toBe(sampleUser.id);
    expect(payload.username).toBe(sampleUser.username);
  });
});
