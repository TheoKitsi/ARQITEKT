import { config } from '../config.js';
import type { UserProfile } from '../types/auth.js';

/* ------------------------------------------------------------------ */
/*  OIDC Discovery + Token Exchange                                    */
/* ------------------------------------------------------------------ */

interface OidcDiscovery {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  issuer: string;
}

let discoveryCache: OidcDiscovery | null = null;

/**
 * Fetch the OIDC discovery document (.well-known/openid-configuration).
 */
async function discover(): Promise<OidcDiscovery> {
  if (discoveryCache) return discoveryCache;

  const url = config.oidcIssuer.replace(/\/+$/, '') + '/.well-known/openid-configuration';
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    throw new Error(`OIDC discovery failed: ${res.status} ${res.statusText}`);
  }
  discoveryCache = (await res.json()) as OidcDiscovery;
  return discoveryCache;
}

/**
 * Build the OIDC authorization redirect URL.
 */
export async function getOidcAuthUrl(state: string): Promise<string> {
  const disco = await discover();
  const params = new URLSearchParams({
    client_id: config.oidcClientId,
    redirect_uri: config.oidcCallbackUrl,
    response_type: 'code',
    scope: config.oidcScopes,
    state,
  });
  return `${disco.authorization_endpoint}?${params}`;
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeOidcCode(code: string): Promise<{ accessToken: string; idToken?: string }> {
  const disco = await discover();
  const res = await fetch(disco.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.oidcClientId,
      client_secret: config.oidcClientSecret,
      redirect_uri: config.oidcCallbackUrl,
      code,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OIDC token exchange failed: ${text}`);
  }

  const data = (await res.json()) as { access_token: string; id_token?: string };
  return { accessToken: data.access_token, idToken: data.id_token };
}

/**
 * Fetch user profile from the OIDC userinfo endpoint.
 */
export async function fetchOidcUser(accessToken: string): Promise<UserProfile> {
  const disco = await discover();
  const res = await fetch(disco.userinfo_endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`OIDC userinfo failed: ${res.status}`);
  }

  const info = (await res.json()) as {
    sub: string;
    preferred_username?: string;
    name?: string;
    picture?: string;
    email?: string;
  };

  return {
    id: info.sub,
    username: info.preferred_username || info.sub,
    displayName: info.name || info.preferred_username || info.sub,
    avatarUrl: info.picture || '',
    email: info.email || undefined,
  };
}
