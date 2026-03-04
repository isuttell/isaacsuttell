import type { ActionCtx } from '../_generated/server';
import { internal } from '../_generated/api';
import { generateRandomToken, hashToken } from './auth';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

const CODE_TTL = 5 * 60 * 1000; // 5 minutes
const PENDING_TTL = 10 * 60 * 1000; // 10 minutes
const TOKEN_TTL = 60 * 60 * 1000; // 1 hour

const SUPPORTED_SCOPES = ['blog:manage'];

// S256 challenge is always 43 chars of base64url (256 bits without padding)
const CODE_CHALLENGE_RE = /^[A-Za-z0-9_-]{43}$/;
const MAX_STATE_LENGTH = 1024;
const MAX_CLIENT_ID_LENGTH = 256;

// Valid Google OAuth error codes per spec
const VALID_OAUTH_ERRORS = [
  'access_denied',
  'invalid_request',
  'unauthorized_client',
  'unsupported_response_type',
  'invalid_scope',
  'server_error',
  'temporarily_unavailable',
];

function getSiteUrl(): string {
  const url = process.env.CONVEX_SITE_URL;
  if (!url) throw new Error('CONVEX_SITE_URL not set');
  return url;
}

/**
 * Validate redirect_uri against allowed patterns.
 * MCP clients typically use localhost or 127.0.0.1 callbacks.
 * Additional allowed URIs can be set via ALLOWED_REDIRECT_URIS env var.
 */
function isAllowedRedirectUri(uri: string): boolean {
  try {
    const parsed = new URL(uri);

    // Allow localhost and 127.0.0.1 on any port (standard for MCP clients)
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '[::1]'
    ) {
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }

    // Allow additional URIs from env var (comma-separated)
    const extra = process.env.ALLOWED_REDIRECT_URIS;
    if (extra) {
      const allowed = extra.split(',').map((u) => u.trim());
      return allowed.includes(uri);
    }

    return false;
  } catch {
    return false;
  }
}

// --- Metadata endpoints ---

export function handleProtectedResourceMetadata(): Response {
  const siteUrl = getSiteUrl();
  return Response.json({
    resource: siteUrl,
    authorization_servers: [siteUrl],
    bearer_methods_supported: ['header'],
    scopes_supported: SUPPORTED_SCOPES,
  });
}

export function handleAuthServerMetadata(): Response {
  const siteUrl = getSiteUrl();
  return Response.json({
    issuer: siteUrl,
    authorization_endpoint: `${siteUrl}/oauth/authorize`,
    token_endpoint: `${siteUrl}/oauth/token`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    registration_endpoint: `${siteUrl}/oauth/register`,
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: SUPPORTED_SCOPES,
  });
}

// --- Dynamic Client Registration (RFC 7591) ---

export async function handleRegister(ctx: ActionCtx, request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'invalid_client_metadata', error_description: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json(
      { error: 'invalid_client_metadata', error_description: 'Expected a JSON object' },
      { status: 400 }
    );
  }

  const metadata = body as Record<string, unknown>;
  const redirectUris = metadata.redirect_uris;
  const clientName = metadata.client_name;

  if (!Array.isArray(redirectUris) || redirectUris.length === 0) {
    return Response.json(
      {
        error: 'invalid_redirect_uri',
        error_description: 'redirect_uris is required and must be a non-empty array',
      },
      { status: 400 }
    );
  }

  for (const uri of redirectUris) {
    if (typeof uri !== 'string' || !isAllowedRedirectUri(uri)) {
      return Response.json(
        { error: 'invalid_redirect_uri', error_description: `Redirect URI not allowed: ${uri}` },
        { status: 400 }
      );
    }
  }

  const clientId = generateRandomToken();
  await ctx.runMutation(internal.mcp.internal.createClient, {
    clientId,
    redirectUris: redirectUris as string[],
    clientName: typeof clientName === 'string' ? clientName : undefined,
    createdAt: Date.now(),
  });

  return Response.json(
    {
      client_id: clientId,
      redirect_uris: redirectUris,
      ...(typeof clientName === 'string' && { client_name: clientName }),
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code'],
      response_types: ['code'],
    },
    { status: 201 }
  );
}

// --- Authorization endpoint ---

export async function handleAuthorize(ctx: ActionCtx, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const clientId = url.searchParams.get('client_id');
  const redirectUri = url.searchParams.get('redirect_uri');
  const responseType = url.searchParams.get('response_type');
  const codeChallenge = url.searchParams.get('code_challenge');
  const codeChallengeMethod = url.searchParams.get('code_challenge_method');
  const mcpState = url.searchParams.get('state') ?? '';
  const scope = url.searchParams.get('scope') ?? 'blog:manage';

  if (!clientId || !redirectUri || !codeChallenge) {
    return Response.json(
      { error: 'invalid_request', error_description: 'Missing required parameters' },
      { status: 400 }
    );
  }

  if (clientId.length > MAX_CLIENT_ID_LENGTH) {
    return Response.json(
      { error: 'invalid_request', error_description: 'client_id too long' },
      { status: 400 }
    );
  }

  if (mcpState.length > MAX_STATE_LENGTH) {
    return Response.json(
      { error: 'invalid_request', error_description: 'state too long' },
      { status: 400 }
    );
  }

  // Validate client_id is registered and redirect_uri matches
  const client = await ctx.runQuery(internal.mcp.internal.getClient, { clientId });
  if (!client) {
    return Response.json(
      {
        error: 'invalid_request',
        error_description: 'Unknown client_id. Register via /oauth/register first.',
      },
      { status: 400 }
    );
  }
  if (!client.redirectUris.includes(redirectUri)) {
    return Response.json(
      {
        error: 'invalid_request',
        error_description: 'redirect_uri does not match registered URIs for this client',
      },
      { status: 400 }
    );
  }

  if (responseType !== 'code') {
    return Response.json({ error: 'unsupported_response_type' }, { status: 400 });
  }

  if (codeChallengeMethod !== 'S256') {
    return Response.json(
      {
        error: 'invalid_request',
        error_description: 'Only S256 code challenge method is supported',
      },
      { status: 400 }
    );
  }

  if (!CODE_CHALLENGE_RE.test(codeChallenge)) {
    return Response.json(
      { error: 'invalid_request', error_description: 'Invalid code_challenge format' },
      { status: 400 }
    );
  }

  // Validate scope — reject if no requested scopes are supported
  const requestedScopes = scope.split(' ').filter((s) => SUPPORTED_SCOPES.includes(s));
  if (requestedScopes.length === 0) {
    return Response.json(
      {
        error: 'invalid_scope',
        error_description: `Supported scopes: ${SUPPORTED_SCOPES.join(', ')}`,
      },
      { status: 400 }
    );
  }
  const validatedScope = requestedScopes.join(' ');

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) throw new Error('GOOGLE_CLIENT_ID not set');

  const googleState = generateRandomToken();
  await ctx.runMutation(internal.mcp.internal.createPending, {
    state: googleState,
    clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod: 'S256',
    scope: validatedScope,
    mcpState,
    expiresAt: Date.now() + PENDING_TTL,
  });

  const siteUrl = getSiteUrl();
  const googleParams = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: `${siteUrl}/oauth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state: googleState,
    access_type: 'online',
    prompt: 'select_account',
  });

  return new Response(null, {
    status: 302,
    headers: { Location: `${GOOGLE_AUTH_URL}?${googleParams}` },
  });
}

// --- Google callback ---

export async function handleCallback(ctx: ActionCtx, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const googleCode = url.searchParams.get('code');
  const googleState = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    // Only reflect known OAuth error codes, not arbitrary input
    const safeError = VALID_OAUTH_ERRORS.includes(error) ? error : 'unknown_error';
    return new Response(`Authentication denied: ${safeError}`, {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  if (!googleCode || !googleState) {
    return new Response('Missing code or state', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const pending = await ctx.runQuery(internal.mcp.internal.getPending, {
    state: googleState,
  });
  if (!pending) {
    return new Response('Invalid authorization request', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  if (pending.expiresAt < Date.now()) {
    // Clean up expired record opportunistically
    await ctx.runMutation(internal.mcp.internal.deletePending, {
      id: pending._id,
    });
    return new Response('Authorization request expired', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const siteUrl = getSiteUrl();
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!googleClientId || !googleClientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  // Exchange Google code for tokens
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: googleCode,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: `${siteUrl}/oauth/callback`,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    return new Response('Failed to exchange Google authorization code', {
      status: 502,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const googleTokens = (await tokenResponse.json()) as { access_token: string };

  const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${googleTokens.access_token}` },
  });

  if (!userInfoResponse.ok) {
    return new Response('Failed to get user info from Google', {
      status: 502,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const userInfo = (await userInfoResponse.json()) as {
    email: string;
    email_verified: boolean;
  };

  if (!userInfo.email_verified) {
    return new Response('Google email not verified', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const user = await ctx.runQuery(internal.users.internal.getByEmail, {
    email: userInfo.email,
  });

  if (!user || user.role !== 'admin') {
    return new Response('Access denied: user is not an admin', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Generate authorization code for the MCP client (store hashed)
  const code = generateRandomToken();
  const codeHash = await hashToken(code);
  await ctx.runMutation(internal.mcp.internal.createCode, {
    code: codeHash,
    clientId: pending.clientId,
    redirectUri: pending.redirectUri,
    codeChallenge: pending.codeChallenge,
    userId: user._id,
    scope: pending.scope,
    expiresAt: Date.now() + CODE_TTL,
  });

  // Clean up pending request
  await ctx.runMutation(internal.mcp.internal.deletePending, {
    id: pending._id,
  });

  // Redirect back to the MCP client
  const redirectParams = new URLSearchParams({ code });
  if (pending.mcpState) {
    redirectParams.set('state', pending.mcpState);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${pending.redirectUri}?${redirectParams}`,
    },
  });
}

// --- Token endpoint ---

export async function handleToken(ctx: ActionCtx, request: Request): Promise<Response> {
  const body = await request.text();
  const params = new URLSearchParams(body);

  const grantType = params.get('grant_type');
  const code = params.get('code');
  const redirectUri = params.get('redirect_uri');
  const clientId = params.get('client_id');
  const codeVerifier = params.get('code_verifier');

  if (grantType !== 'authorization_code') {
    return Response.json({ error: 'unsupported_grant_type' }, { status: 400 });
  }

  if (!code || !codeVerifier || !clientId || !redirectUri) {
    return Response.json(
      {
        error: 'invalid_request',
        error_description:
          'Missing required parameters (code, code_verifier, client_id, redirect_uri)',
      },
      { status: 400 }
    );
  }

  // Atomic: lookup code, verify PKCE, mark used, issue token — all in one mutation
  const accessToken = generateRandomToken();
  const accessTokenHash = await hashToken(accessToken);
  const codeHash = await hashToken(code);
  const result = await ctx.runMutation(internal.mcp.internal.exchangeCodeForToken, {
    code: codeHash,
    clientId,
    redirectUri,
    codeVerifier,
    accessTokenHash,
    tokenExpiresAt: Date.now() + TOKEN_TTL,
  });

  if (result.error) {
    return Response.json(
      { error: 'invalid_grant', error_description: result.error },
      { status: 400 }
    );
  }

  return Response.json(
    {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: TOKEN_TTL / 1000,
      scope: result.scope,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      },
    }
  );
}
