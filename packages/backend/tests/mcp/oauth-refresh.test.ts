import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';
import schema from '../../convex/schema';
import { modules } from '../test_setup';
import { internal } from '../../convex/_generated/api';
import { handleAuthServerMetadata, handleToken } from '../../convex/mcp/oauth';
import { computePkceChallenge, hashToken } from '../../convex/mcp/auth';
import type { ActionCtx } from '../../convex/_generated/server';

describe('mcp oauth refresh tokens', () => {
  it('handleAuthServerMetadata_advertisesRefreshGrantType', async () => {
    process.env.CONVEX_SITE_URL = 'https://example.convex.site';

    const response = handleAuthServerMetadata();
    expect(response.status).toBe(200);
    const body = (await response.json()) as { grant_types_supported: string[] };
    expect(body.grant_types_supported).toContain('refresh_token');
  });

  it('exchangeCodeForToken_createsAccessAndRefreshRecords', async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert('users', { email: 'admin@test.com', role: 'admin' });
    });

    const codeVerifier = 'test-verifier-123';
    const codeChallenge = await computePkceChallenge(codeVerifier);
    const rawCode = 'code-abc';
    const codeHash = await hashToken(rawCode);

    await t.run(async (ctx) => {
      await ctx.db.insert('mcpOauthCodes', {
        code: codeHash,
        clientId: 'client-123',
        redirectUri: 'http://localhost:3000/callback',
        codeChallenge,
        userId,
        scope: 'blog:manage',
        expiresAt: Date.now() + 60_000,
        used: false,
      });
    });

    const result = await t.mutation(internal.mcp.internal.exchangeCodeForToken, {
      code: codeHash,
      clientId: 'client-123',
      redirectUri: 'http://localhost:3000/callback',
      codeVerifier,
      accessTokenHash: 'access-hash-1',
      accessTokenExpiresAt: Date.now() + 3_600_000,
      refreshTokenHash: 'refresh-hash-1',
      refreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      refreshFamilyId: 'family-1',
    });

    expect(result.error).toBeUndefined();
    expect(result.scope).toBe('blog:manage');

    await t.run(async (ctx) => {
      const access = await ctx.db
        .query('mcpOauthTokens')
        .withIndex('by_token', (q) => q.eq('token', 'access-hash-1'))
        .unique();
      const refresh = await ctx.db
        .query('mcpOauthRefreshTokens')
        .withIndex('by_token', (q) => q.eq('token', 'refresh-hash-1'))
        .unique();

      expect(access).not.toBeNull();
      expect(refresh).not.toBeNull();
      expect(refresh!.familyId).toBe('family-1');
      expect(refresh!.clientId).toBe('client-123');
      expect(refresh!.scope).toBe('blog:manage');
    });
  });

  it('handleToken_authorizationCodeReturnsRefreshToken', async () => {
    const ctx = {
      runMutation: async () => ({ scope: 'blog:manage' }),
    } as unknown as ActionCtx;

    const request = new Request('https://example.convex.site/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: 'abc',
        code_verifier: 'verifier',
        client_id: 'client-123',
        redirect_uri: 'http://localhost:3000/callback',
      }),
    });

    const response = await handleToken(ctx, request);
    const body = (await response.json()) as { refresh_token?: string; access_token?: string };

    expect(response.status).toBe(200);
    expect(body.access_token).toBeTypeOf('string');
    expect(body.refresh_token).toBeTypeOf('string');
  });

  it('handleToken_refreshGrantReturnsRotatedRefreshToken', async () => {
    const ctx = {
      runMutation: async () => ({ scope: 'blog:manage' }),
    } as unknown as ActionCtx;

    const request = new Request('https://example.convex.site/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: 'refresh-token-1',
        client_id: 'client-123',
      }),
    });

    const response = await handleToken(ctx, request);
    const body = (await response.json()) as { refresh_token?: string; access_token?: string };

    expect(response.status).toBe(200);
    expect(body.access_token).toBeTypeOf('string');
    expect(body.refresh_token).toBeTypeOf('string');
  });

  it('rotateRefreshToken_rotatesAndRejectsReuse', async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert('users', { email: 'admin@test.com', role: 'admin' });
    });

    await t.run(async (ctx) => {
      await ctx.db.insert('mcpOauthRefreshTokens', {
        token: 'refresh-original',
        clientId: 'client-123',
        userId,
        scope: 'blog:manage',
        familyId: 'family-rotate',
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
    });

    const firstRotate = await t.mutation(internal.mcp.internal.rotateRefreshToken, {
      refreshTokenHash: 'refresh-original',
      clientId: 'client-123',
      newAccessTokenHash: 'access-new-1',
      newAccessTokenExpiresAt: Date.now() + 3_600_000,
      newRefreshTokenHash: 'refresh-new-1',
      newRefreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    expect(firstRotate.error).toBeUndefined();
    expect(firstRotate.scope).toBe('blog:manage');

    await t.run(async (ctx) => {
      const original = await ctx.db
        .query('mcpOauthRefreshTokens')
        .withIndex('by_token', (q) => q.eq('token', 'refresh-original'))
        .unique();
      const replacement = await ctx.db
        .query('mcpOauthRefreshTokens')
        .withIndex('by_token', (q) => q.eq('token', 'refresh-new-1'))
        .unique();

      expect(original).not.toBeNull();
      expect(replacement).not.toBeNull();
      expect(original!.usedAt).toBeTypeOf('number');
      expect(original!.replacedByTokenId).toEqual(replacement!._id);
      expect(replacement!.parentTokenId).toEqual(original!._id);
    });

    const replayAttempt = await t.mutation(internal.mcp.internal.rotateRefreshToken, {
      refreshTokenHash: 'refresh-original',
      clientId: 'client-123',
      newAccessTokenHash: 'access-new-2',
      newAccessTokenExpiresAt: Date.now() + 3_600_000,
      newRefreshTokenHash: 'refresh-new-2',
      newRefreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    expect(replayAttempt.error).toBe('Refresh token reuse detected');

    await t.run(async (ctx) => {
      const family = await ctx.db
        .query('mcpOauthRefreshTokens')
        .withIndex('by_familyId', (q) => q.eq('familyId', 'family-rotate'))
        .collect();
      expect(family.length).toBe(2);
      expect(family.every((token) => Boolean(token.revokedAt))).toBe(true);
    });
  });

  it('handleToken_authorizationCodeReturnsCorrectExpiresIn', async () => {
    const ctx = {
      runMutation: async () => ({ scope: 'blog:manage' }),
    } as unknown as ActionCtx;

    const request = new Request('https://example.convex.site/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: 'abc',
        code_verifier: 'verifier',
        client_id: 'client-123',
        redirect_uri: 'http://localhost:3000/callback',
      }),
    });

    const response = await handleToken(ctx, request);
    const body = (await response.json()) as { expires_in?: number };
    expect(body.expires_in).toBe(3600);
  });

  it('rotateRefreshToken_rejectsClientIdMismatch', async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert('users', { email: 'admin@test.com', role: 'admin' });
    });

    await t.run(async (ctx) => {
      await ctx.db.insert('mcpOauthRefreshTokens', {
        token: 'refresh-mismatch',
        clientId: 'client-123',
        userId,
        scope: 'blog:manage',
        familyId: 'family-mismatch',
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
    });

    const result = await t.mutation(internal.mcp.internal.rotateRefreshToken, {
      refreshTokenHash: 'refresh-mismatch',
      clientId: 'wrong-client',
      newAccessTokenHash: 'access-new',
      newAccessTokenExpiresAt: Date.now() + 3_600_000,
      newRefreshTokenHash: 'refresh-new',
      newRefreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    expect(result.error).toBe('Client ID mismatch');
  });

  it('rotateRefreshToken_revokesAccessTokensOnReuse', async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert('users', { email: 'admin@test.com', role: 'admin' });
    });

    await t.run(async (ctx) => {
      await ctx.db.insert('mcpOauthRefreshTokens', {
        token: 'refresh-for-access-revoke',
        clientId: 'client-123',
        userId,
        scope: 'blog:manage',
        familyId: 'family-access-revoke',
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
    });

    // First rotation succeeds and creates access token with familyId
    const firstRotate = await t.mutation(internal.mcp.internal.rotateRefreshToken, {
      refreshTokenHash: 'refresh-for-access-revoke',
      clientId: 'client-123',
      newAccessTokenHash: 'access-family-1',
      newAccessTokenExpiresAt: Date.now() + 3_600_000,
      newRefreshTokenHash: 'refresh-family-1',
      newRefreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    expect(firstRotate.error).toBeUndefined();

    // Verify access token exists with familyId
    await t.run(async (ctx) => {
      const access = await ctx.db
        .query('mcpOauthTokens')
        .withIndex('by_familyId', (q) => q.eq('familyId', 'family-access-revoke'))
        .collect();
      expect(access.length).toBe(1);
    });

    // Replay the original token to trigger reuse detection
    await t.mutation(internal.mcp.internal.rotateRefreshToken, {
      refreshTokenHash: 'refresh-for-access-revoke',
      clientId: 'client-123',
      newAccessTokenHash: 'access-family-2',
      newAccessTokenExpiresAt: Date.now() + 3_600_000,
      newRefreshTokenHash: 'refresh-family-2',
      newRefreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    // Access tokens in the family should be deleted
    await t.run(async (ctx) => {
      const access = await ctx.db
        .query('mcpOauthTokens')
        .withIndex('by_familyId', (q) => q.eq('familyId', 'family-access-revoke'))
        .collect();
      expect(access.length).toBe(0);
    });
  });

  it('purgeExpired_deletesExpiredButPreservesReuseDetectedRecords', async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert('users', { email: 'admin@test.com', role: 'admin' });
    });

    await t.run(async (ctx) => {
      // Expired token that should be purged
      await ctx.db.insert('mcpOauthRefreshTokens', {
        token: 'refresh-purge-normal',
        clientId: 'client-123',
        userId,
        scope: 'blog:manage',
        familyId: 'family-purge',
        createdAt: Date.now() - 100_000,
        expiresAt: Date.now() - 1,
      });

      // Expired token revoked due to reuse — should be preserved
      await ctx.db.insert('mcpOauthRefreshTokens', {
        token: 'refresh-purge-reuse',
        clientId: 'client-123',
        userId,
        scope: 'blog:manage',
        familyId: 'family-purge',
        createdAt: Date.now() - 100_000,
        expiresAt: Date.now() - 1,
        revokedAt: Date.now() - 50_000,
        revokedReason: 'reuse_detected',
      });

      // Non-expired token should be preserved
      await ctx.db.insert('mcpOauthRefreshTokens', {
        token: 'refresh-purge-valid',
        clientId: 'client-123',
        userId,
        scope: 'blog:manage',
        familyId: 'family-purge-2',
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
    });

    await t.mutation(internal.mcp.internal.purgeExpired, {});

    await t.run(async (ctx) => {
      const normal = await ctx.db
        .query('mcpOauthRefreshTokens')
        .withIndex('by_token', (q) => q.eq('token', 'refresh-purge-normal'))
        .unique();
      const reuse = await ctx.db
        .query('mcpOauthRefreshTokens')
        .withIndex('by_token', (q) => q.eq('token', 'refresh-purge-reuse'))
        .unique();
      const valid = await ctx.db
        .query('mcpOauthRefreshTokens')
        .withIndex('by_token', (q) => q.eq('token', 'refresh-purge-valid'))
        .unique();

      expect(normal).toBeNull();
      expect(reuse).not.toBeNull();
      expect(valid).not.toBeNull();
    });
  });

  it('exchangeCodeForToken_storesFamilyIdOnAccessToken', async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert('users', { email: 'admin@test.com', role: 'admin' });
    });

    const codeVerifier = 'test-verifier-family';
    const codeChallenge = await computePkceChallenge(codeVerifier);
    const rawCode = 'code-family';
    const codeHash = await hashToken(rawCode);

    await t.run(async (ctx) => {
      await ctx.db.insert('mcpOauthCodes', {
        code: codeHash,
        clientId: 'client-123',
        redirectUri: 'http://localhost:3000/callback',
        codeChallenge,
        userId,
        scope: 'blog:manage',
        expiresAt: Date.now() + 60_000,
        used: false,
      });
    });

    await t.mutation(internal.mcp.internal.exchangeCodeForToken, {
      code: codeHash,
      clientId: 'client-123',
      redirectUri: 'http://localhost:3000/callback',
      codeVerifier,
      accessTokenHash: 'access-hash-family',
      accessTokenExpiresAt: Date.now() + 3_600_000,
      refreshTokenHash: 'refresh-hash-family',
      refreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      refreshFamilyId: 'family-test',
    });

    await t.run(async (ctx) => {
      const access = await ctx.db
        .query('mcpOauthTokens')
        .withIndex('by_token', (q) => q.eq('token', 'access-hash-family'))
        .unique();
      expect(access).not.toBeNull();
      expect(access!.familyId).toBe('family-test');
    });
  });

  it('rotateRefreshToken_rejectsExpiredToken', async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert('users', { email: 'admin@test.com', role: 'admin' });
    });

    await t.run(async (ctx) => {
      await ctx.db.insert('mcpOauthRefreshTokens', {
        token: 'refresh-expired',
        clientId: 'client-123',
        userId,
        scope: 'blog:manage',
        familyId: 'family-expired',
        createdAt: Date.now() - 1000,
        expiresAt: Date.now() - 1,
      });
    });

    const result = await t.mutation(internal.mcp.internal.rotateRefreshToken, {
      refreshTokenHash: 'refresh-expired',
      clientId: 'client-123',
      newAccessTokenHash: 'access-new-expired',
      newAccessTokenExpiresAt: Date.now() + 3_600_000,
      newRefreshTokenHash: 'refresh-new-expired',
      newRefreshTokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    expect(result.error).toBe('Refresh token expired');
  });
});
