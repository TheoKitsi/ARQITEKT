import { Router } from 'express';
import { randomUUID } from 'crypto';
import { config } from '../config.js';
import {
  exchangeCodeForToken,
  fetchGithubUser,
  signTokens,
  verifyToken,
  upsertUser,
  getUser,
} from '../services/auth.js';
import { getOidcAuthUrl, exchangeOidcCode, fetchOidcUser } from '../services/oidc.js';

export const authRouter = Router();

/* ------------------------------------------------------------------ */
/*  Cookie options                                                     */
/* ------------------------------------------------------------------ */

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/api/auth/refresh',
};

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

// GET /api/auth/me — Auth status probe (always public)
authRouter.get('/me', (req, res) => {
  if (!config.authEnabled) {
    res.json({
      authenticated: false,
      authEnabled: false,
      user: { id: 'local', username: 'local', displayName: 'Local User', avatarUrl: '' },
    });
    return;
  }

  const token = req.cookies?.arqitekt_token as string | undefined;
  if (!token) {
    res.json({ authenticated: false, authEnabled: true, user: null });
    return;
  }

  try {
    const payload = verifyToken(token);
    res.json({
      authenticated: true,
      authEnabled: true,
      user: { id: payload.sub, username: payload.username },
    });
  } catch {
    res.json({ authenticated: false, authEnabled: true, user: null });
  }
});

// GET /api/auth/github — Redirect to GitHub OAuth authorization
authRouter.get('/github', (_req, res) => {
  if (!config.authEnabled) {
    res.status(404).json({ error: 'Authentication is disabled' });
    return;
  }

  if (!config.githubClientId) {
    res.status(500).json({ error: 'GITHUB_CLIENT_ID not configured' });
    return;
  }

  const params = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: config.githubCallbackUrl,
    scope: 'read:user user:email',
    state: randomUUID(),
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// GET /api/auth/github/callback — OAuth callback
authRouter.get('/github/callback', async (req, res, next) => {
  try {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.status(400).json({ error: 'Missing code parameter' });
      return;
    }

    const accessToken = await exchangeCodeForToken(code);
    const profile = await fetchGithubUser(accessToken);
    await upsertUser(profile, accessToken);

    const { token, refreshToken } = signTokens(profile);

    res.cookie('arqitekt_token', token, COOKIE_OPTIONS);
    res.cookie('arqitekt_refresh', refreshToken, REFRESH_COOKIE_OPTIONS);

    // Redirect to frontend
    res.redirect(config.publicUrl);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh — Refresh access token
authRouter.post('/refresh', async (req, res, _next) => {
  try {
    const refreshTokenCookie = req.cookies?.arqitekt_refresh as string | undefined;
    if (!refreshTokenCookie) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }

    const payload = verifyToken(refreshTokenCookie);
    const user = await getUser(payload.sub);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const tokens = signTokens(user.profile);
    res.cookie('arqitekt_token', tokens.token, COOKIE_OPTIONS);
    res.cookie('arqitekt_refresh', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({ user: user.profile });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout — Clear cookies
authRouter.post('/logout', (_req, res) => {
  res.clearCookie('arqitekt_token', { path: '/' });
  res.clearCookie('arqitekt_refresh', { path: '/api/auth/refresh' });
  res.json({ success: true });
});

/* ------------------------------------------------------------------ */
/*  OIDC/SSO routes                                                    */
/* ------------------------------------------------------------------ */

// GET /api/auth/oidc — Redirect to OIDC provider
authRouter.get('/oidc', async (_req, res, next) => {
  try {
    if (!config.authEnabled || !config.oidcEnabled) {
      res.status(404).json({ error: 'OIDC authentication is not enabled' });
      return;
    }
    if (!config.oidcIssuer || !config.oidcClientId) {
      res.status(500).json({ error: 'OIDC provider not configured' });
      return;
    }
    const state = randomUUID();
    const url = await getOidcAuthUrl(state);
    res.redirect(url);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/oidc/callback — OIDC callback
authRouter.get('/oidc/callback', async (req, res, next) => {
  try {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.status(400).json({ error: 'Missing code parameter' });
      return;
    }

    const { accessToken } = await exchangeOidcCode(code);
    const profile = await fetchOidcUser(accessToken);
    await upsertUser(profile, accessToken);

    const { token, refreshToken } = signTokens(profile);

    res.cookie('arqitekt_token', token, COOKIE_OPTIONS);
    res.cookie('arqitekt_refresh', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.redirect(config.publicUrl);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/providers — List available auth providers
authRouter.get('/providers', (_req, res) => {
  const providers: string[] = [];
  if (config.githubClientId) providers.push('github');
  if (config.oidcEnabled && config.oidcIssuer) providers.push('oidc');
  res.json({ authEnabled: config.authEnabled, providers });
});
