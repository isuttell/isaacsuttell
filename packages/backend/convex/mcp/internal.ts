import { v } from 'convex/values';
import { internalMutation, internalQuery } from '../_generated/server';
import { computePkceChallenge, timingSafeEqual } from './auth';

// --- OAuth clients (dynamic registration) ---

export const createClient = internalMutation({
  args: {
    clientId: v.string(),
    redirectUris: v.array(v.string()),
    clientName: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('mcpOauthClients', args);
  },
});

export const getClient = internalQuery({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('mcpOauthClients')
      .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
      .unique();
  },
});

// --- Pending auth requests (authorize → Google redirect) ---

export const createPending = internalMutation({
  args: {
    state: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
    scope: v.string(),
    mcpState: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('mcpOauthPending', args);
  },
});

export const getPending = internalQuery({
  args: { state: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('mcpOauthPending')
      .withIndex('by_state', (q) => q.eq('state', args.state))
      .unique();
  },
});

export const deletePending = internalMutation({
  args: { id: v.id('mcpOauthPending') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// --- Authorization codes ---

export const createCode = internalMutation({
  args: {
    code: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    codeChallenge: v.string(),
    userId: v.id('users'),
    scope: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('mcpOauthCodes', {
      ...args,
      used: false,
    });
  },
});

// --- Access tokens (stored as SHA-256 hashes) ---

export const getToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // `token` arg is already the hash — caller hashes before calling
    return await ctx.db
      .query('mcpOauthTokens')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique();
  },
});

// --- Atomic code exchange (prevents TOCTOU race on code reuse) ---

export const exchangeCodeForToken = internalMutation({
  args: {
    code: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    codeVerifier: v.string(),
    accessTokenHash: v.string(),
    tokenExpiresAt: v.number(),
  },
  handler: async (ctx, args): Promise<{ error?: string; scope?: string }> => {
    const codeRecord = await ctx.db
      .query('mcpOauthCodes')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .unique();

    if (!codeRecord) return { error: 'Invalid authorization code' };
    if (codeRecord.used) return { error: 'Authorization code already used' };
    if (codeRecord.expiresAt < Date.now()) return { error: 'Authorization code expired' };
    if (codeRecord.clientId !== args.clientId) return { error: 'Client ID mismatch' };
    if (codeRecord.redirectUri !== args.redirectUri) return { error: 'Redirect URI mismatch' };

    // Verify PKCE with constant-time comparison
    const computed = await computePkceChallenge(args.codeVerifier);
    if (!timingSafeEqual(computed, codeRecord.codeChallenge)) {
      return { error: 'PKCE verification failed' };
    }

    // Atomically mark code used and create token in same transaction
    await ctx.db.patch(codeRecord._id, { used: true });
    await ctx.db.insert('mcpOauthTokens', {
      token: args.accessTokenHash,
      userId: codeRecord.userId,
      scope: codeRecord.scope,
      expiresAt: args.tokenExpiresAt,
    });

    return { scope: codeRecord.scope };
  },
});

// --- Cleanup expired records (bounded by index, not full scan) ---

const PURGE_BATCH_SIZE = 500;

export const purgeExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const pendingExpired = await ctx.db
      .query('mcpOauthPending')
      .withIndex('by_expiresAt', (q) => q.lt('expiresAt', now))
      .take(PURGE_BATCH_SIZE);
    for (const record of pendingExpired) {
      await ctx.db.delete(record._id);
    }

    const codesExpired = await ctx.db
      .query('mcpOauthCodes')
      .withIndex('by_expiresAt', (q) => q.lt('expiresAt', now))
      .take(PURGE_BATCH_SIZE);
    for (const record of codesExpired) {
      await ctx.db.delete(record._id);
    }

    const tokensExpired = await ctx.db
      .query('mcpOauthTokens')
      .withIndex('by_expiresAt', (q) => q.lt('expiresAt', now))
      .take(PURGE_BATCH_SIZE);
    for (const record of tokensExpired) {
      await ctx.db.delete(record._id);
    }
  },
});
