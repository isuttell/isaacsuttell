import type { ActionCtx } from '../_generated/server';
import { internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';

export interface McpAuthContext {
  userId: Id<'users'>;
  scope: string;
}

/**
 * Validate a Bearer token from the Authorization header.
 * Tokens are stored as SHA-256 hashes — we hash the incoming token before lookup.
 */
export async function validateBearerToken(
  ctx: ActionCtx,
  request: Request
): Promise<McpAuthContext> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new McpAuthError(401, 'Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);
  const tokenHash = await hashToken(token);
  const record = await ctx.runQuery(internal.mcp.internal.getToken, {
    token: tokenHash,
  });

  if (!record || record.expiresAt < Date.now()) {
    throw new McpAuthError(401, 'Invalid or expired access token');
  }

  return { userId: record.userId, scope: record.scope };
}

export class McpAuthError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'McpAuthError';
    Object.setPrototypeOf(this, McpAuthError.prototype);
  }
}

/**
 * Generate a cryptographically random hex token.
 */
export function generateRandomToken(bytes = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * SHA-256 hash a token for storage/lookup.
 */
export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Constant-time string comparison to prevent timing side-channels.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Compute the PKCE S256 challenge from a verifier.
 * Returns BASE64URL(SHA256(verifier)).
 */
export async function computePkceChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
