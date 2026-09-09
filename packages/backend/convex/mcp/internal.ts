import { v } from 'convex/values';
import { internalMutation, internalQuery } from '../_generated/server';
import { computePkceChallenge, timingSafeEqual } from './auth';

// --- OAuth clients (dynamic registration) ---

const CLIENT_TTL = 30 * 24 * 60 * 60 * 1000;
const REGISTRATION_WINDOW = 60 * 60 * 1000;
const REGISTRATIONS_PER_WINDOW = 20;
const MAX_ACTIVE_PENDING = 100;

export const createClient = internalMutation({
  args: {
    clientId: v.string(),
    redirectUris: v.array(v.string()),
    clientName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const recent = await ctx.db
      .query('mcpOauthClients')
      .withIndex('by_createdAt', (q) => q.gt('createdAt', now - REGISTRATION_WINDOW))
      .take(REGISTRATIONS_PER_WINDOW);

    if (recent.length >= REGISTRATIONS_PER_WINDOW) {
      return { error: 'rate_limited' as const };
    }

    await ctx.db.insert('mcpOauthClients', {
      ...args,
      createdAt: now,
      expiresAt: now + CLIENT_TTL,
    });
    return { clientId: args.clientId };
  },
});

export const getClient = internalQuery({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    const client = await ctx.db
      .query('mcpOauthClients')
      .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
      .unique();
    if (!client) return null;

    const expiresAt = client.expiresAt ?? client.createdAt + CLIENT_TTL;
    return expiresAt > Date.now() ? client : null;
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
    const active = await ctx.db
      .query('mcpOauthPending')
      .withIndex('by_expiresAt', (q) => q.gt('expiresAt', Date.now()))
      .take(MAX_ACTIVE_PENDING);
    if (active.length >= MAX_ACTIVE_PENDING) {
      return { error: 'too_many_pending' as const };
    }

    const id = await ctx.db.insert('mcpOauthPending', args);
    return { id };
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

export const authenticatePending = internalMutation({
  args: {
    id: v.id('mcpOauthPending'),
    userId: v.id('users'),
    consentToken: v.string(),
  },
  handler: async (ctx, args) => {
    const pending = await ctx.db.get(args.id);
    if (!pending || pending.expiresAt < Date.now()) return { error: 'invalid_request' as const };
    if (pending.userId || pending.consentToken) return { error: 'already_authenticated' as const };

    await ctx.db.patch(args.id, {
      userId: args.userId,
      consentToken: args.consentToken,
    });
    return { ok: true as const };
  },
});

export const completeConsent = internalMutation({
  args: {
    state: v.string(),
    consentToken: v.string(),
    approved: v.boolean(),
    code: v.optional(v.string()),
    codeExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query('mcpOauthPending')
      .withIndex('by_state', (q) => q.eq('state', args.state))
      .unique();

    if (!pending || pending.expiresAt < Date.now()) {
      if (pending) await ctx.db.delete(pending._id);
      return { error: 'invalid_request' as const };
    }
    if (!pending.userId || !pending.consentToken) {
      return { error: 'not_authenticated' as const };
    }
    if (!timingSafeEqual(args.consentToken, pending.consentToken)) {
      return { error: 'invalid_request' as const };
    }
    if (args.approved && (!args.code || !args.codeExpiresAt)) {
      throw new Error('Approved consent requires an authorization code');
    }

    if (args.approved) {
      await ctx.db.insert('mcpOauthCodes', {
        code: args.code!,
        clientId: pending.clientId,
        redirectUri: pending.redirectUri,
        codeChallenge: pending.codeChallenge,
        userId: pending.userId,
        scope: pending.scope,
        expiresAt: args.codeExpiresAt!,
        used: false,
      });
    }

    await ctx.db.delete(pending._id);
    return {
      redirectUri: pending.redirectUri,
      mcpState: pending.mcpState,
      approved: args.approved,
    };
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
    accessTokenExpiresAt: v.number(),
    refreshTokenHash: v.string(),
    refreshTokenExpiresAt: v.number(),
    refreshFamilyId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ error?: string; scope?: string; refreshFamilyId?: string }> => {
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
      familyId: args.refreshFamilyId,
      expiresAt: args.accessTokenExpiresAt,
    });
    await ctx.db.insert('mcpOauthRefreshTokens', {
      token: args.refreshTokenHash,
      clientId: args.clientId,
      userId: codeRecord.userId,
      scope: codeRecord.scope,
      familyId: args.refreshFamilyId,
      createdAt: Date.now(),
      expiresAt: args.refreshTokenExpiresAt,
    });

    return { scope: codeRecord.scope, refreshFamilyId: args.refreshFamilyId };
  },
});

// --- Atomic refresh token rotation with reuse detection ---

export const rotateRefreshToken = internalMutation({
  args: {
    refreshTokenHash: v.string(),
    clientId: v.string(),
    newAccessTokenHash: v.string(),
    newAccessTokenExpiresAt: v.number(),
    newRefreshTokenHash: v.string(),
    newRefreshTokenExpiresAt: v.number(),
  },
  handler: async (ctx, args): Promise<{ error?: string; scope?: string }> => {
    const now = Date.now();
    const refreshRecord = await ctx.db
      .query('mcpOauthRefreshTokens')
      .withIndex('by_token', (q) => q.eq('token', args.refreshTokenHash))
      .unique();

    if (!refreshRecord) return { error: 'Invalid refresh token' };
    if (refreshRecord.clientId !== args.clientId) return { error: 'Client ID mismatch' };
    if (refreshRecord.expiresAt < now) return { error: 'Refresh token expired' };

    const isTokenReused = Boolean(refreshRecord.usedAt || refreshRecord.replacedByTokenId);
    if (isTokenReused || refreshRecord.revokedAt) {
      const familyTokens = await ctx.db
        .query('mcpOauthRefreshTokens')
        .withIndex('by_familyId', (q) => q.eq('familyId', refreshRecord.familyId))
        .collect();

      for (const token of familyTokens) {
        if (!token.revokedAt) {
          await ctx.db.patch(token._id, {
            revokedAt: now,
            revokedReason: 'reuse_detected',
          });
        }
      }

      // Also revoke any outstanding access tokens in this family
      const familyAccessTokens = await ctx.db
        .query('mcpOauthTokens')
        .withIndex('by_familyId', (q) => q.eq('familyId', refreshRecord.familyId))
        .collect();
      for (const accessToken of familyAccessTokens) {
        await ctx.db.delete(accessToken._id);
      }

      return { error: 'Refresh token reuse detected' };
    }

    // Mark old token as used before issuing replacements.
    await ctx.db.patch(refreshRecord._id, { usedAt: now });

    await ctx.db.insert('mcpOauthTokens', {
      token: args.newAccessTokenHash,
      userId: refreshRecord.userId,
      scope: refreshRecord.scope,
      familyId: refreshRecord.familyId,
      expiresAt: args.newAccessTokenExpiresAt,
    });
    const newRefreshId = await ctx.db.insert('mcpOauthRefreshTokens', {
      token: args.newRefreshTokenHash,
      clientId: refreshRecord.clientId,
      userId: refreshRecord.userId,
      scope: refreshRecord.scope,
      familyId: refreshRecord.familyId,
      parentTokenId: refreshRecord._id,
      createdAt: now,
      expiresAt: args.newRefreshTokenExpiresAt,
    });
    await ctx.db.patch(refreshRecord._id, { replacedByTokenId: newRefreshId });

    return { scope: refreshRecord.scope };
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

    const refreshTokensExpired = await ctx.db
      .query('mcpOauthRefreshTokens')
      .withIndex('by_expiresAt', (q) => q.lt('expiresAt', now))
      .take(PURGE_BATCH_SIZE);
    for (const record of refreshTokensExpired) {
      // Preserve tokens revoked due to reuse detection for forensic audit
      if (record.revokedReason === 'reuse_detected') continue;
      await ctx.db.delete(record._id);
    }

    const clientsExpired = await ctx.db
      .query('mcpOauthClients')
      .withIndex('by_createdAt', (q) => q.lt('createdAt', now - CLIENT_TTL))
      .take(PURGE_BATCH_SIZE);
    for (const record of clientsExpired) {
      await ctx.db.delete(record._id);
    }
  },
});
