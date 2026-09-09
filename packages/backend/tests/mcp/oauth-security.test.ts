import { convexTest } from 'convex-test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import schema from '../../convex/schema';
import { modules } from '../test_setup';
import { internal } from '../../convex/_generated/api';
import {
  handleAuthorize,
  handleCallback,
  handleConsent,
  handleRegister,
} from '../../convex/mcp/oauth';
import { hashToken } from '../../convex/mcp/auth';
import type { ActionCtx } from '../../convex/_generated/server';

const callbackUri = 'http://localhost:3000/callback';
const codeChallenge = 'a'.repeat(43);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('mcp oauth security', () => {
  it('handleRegister_rejectsTooManyRedirectUrisBeforeWriting', async () => {
    const runMutation = vi.fn();
    const ctx = { runMutation } as unknown as ActionCtx;
    const response = await handleRegister(
      ctx,
      new Request('https://example.convex.site/oauth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirect_uris: Array.from({ length: 11 }, (_, i) => `http://localhost:${3000 + i}/cb`),
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(runMutation).not.toHaveBeenCalled();
  });

  it('handleRegister_rejectsOversizedBodiesAndClientNamesBeforeWriting', async () => {
    const runMutation = vi.fn();
    const ctx = { runMutation } as unknown as ActionCtx;
    const oversizedBody = await handleRegister(
      ctx,
      new Request('https://example.convex.site/oauth/register', {
        method: 'POST',
        headers: { 'Content-Length': String(16 * 1024 + 1) },
        body: '{}',
      })
    );
    const oversizedBodyWithoutDeclaredLength = await handleRegister(
      ctx,
      new Request('https://example.convex.site/oauth/register', {
        method: 'POST',
        body: 'x'.repeat(16 * 1024 + 1),
      })
    );
    const oversizedName = await handleRegister(
      ctx,
      new Request('https://example.convex.site/oauth/register', {
        method: 'POST',
        body: JSON.stringify({
          redirect_uris: [callbackUri],
          client_name: 'x'.repeat(201),
        }),
      })
    );

    expect(oversizedBody.status).toBe(413);
    expect(oversizedBodyWithoutDeclaredLength.status).toBe(413);
    expect(oversizedName.status).toBe(400);
    expect(runMutation).not.toHaveBeenCalled();
  });

  it('handleRegister_partitionsTheLimitByRequestMetadata', async () => {
    const runMutation = vi.fn(async (_reference, args: { clientId: string }) => ({
      clientId: args.clientId,
    }));
    const ctx = {
      runMutation,
      meta: {
        getRequestMetadata: vi.fn(async () => ({ ip: '203.0.113.1' })),
      },
    } as unknown as ActionCtx;

    const response = await handleRegister(
      ctx,
      new Request('https://example.convex.site/oauth/register', {
        method: 'POST',
        body: JSON.stringify({ redirect_uris: [callbackUri] }),
      })
    );

    expect(response.status).toBe(201);
    expect(runMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ requesterKey: expect.stringMatching(/^[a-f0-9]{64}$/) })
    );
  });

  it('createClient_limitsRegistrationsTransactionallyAndSetsExpiry', async () => {
    const t = convexTest(schema, modules);

    for (let i = 0; i < 20; i++) {
      const result = await t.mutation(internal.mcp.internal.createClient, {
        clientId: `client-${i}`,
        redirectUris: [callbackUri],
        requesterKey: 'requester-a',
      });
      expect(result.error).toBeUndefined();
    }

    const limited = await t.mutation(internal.mcp.internal.createClient, {
      clientId: 'client-over-limit',
      redirectUris: [callbackUri],
      requesterKey: 'requester-a',
    });
    expect(limited.error).toBe('rate_limited');

    const isolated = await t.mutation(internal.mcp.internal.createClient, {
      clientId: 'client-other-requester',
      redirectUris: [callbackUri],
      requesterKey: 'requester-b',
    });
    expect(isolated.error).toBeUndefined();

    await t.run(async (ctx) => {
      const clients = await ctx.db.query('mcpOauthClients').collect();
      expect(clients).toHaveLength(21);
      expect(clients.every((client) => client.expiresAt! > client.createdAt)).toBe(true);
    });
  });

  it('purgeExpired_removesExpiredAndLegacyClients', async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert('mcpOauthClients', {
        clientId: 'expired-client',
        redirectUris: [callbackUri],
        createdAt: Date.now() - 31 * 24 * 60 * 60 * 1000,
        expiresAt: Date.now() - 24 * 60 * 60 * 1000,
      });
      await ctx.db.insert('mcpOauthClients', {
        clientId: 'legacy-expired-client',
        redirectUris: [callbackUri],
        createdAt: Date.now() - 31 * 24 * 60 * 60 * 1000,
      });
    });

    expect(
      await t.query(internal.mcp.internal.getClient, { clientId: 'expired-client' })
    ).toBeNull();
    await t.mutation(internal.mcp.internal.purgeExpired, {});
    await t.run(async (ctx) => {
      expect(await ctx.db.query('mcpOauthClients').collect()).toHaveLength(0);
    });
  });

  it('createPending_limitsActiveAuthorizationRequestsTransactionally', async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      for (let i = 0; i < 100; i++) {
        await ctx.db.insert('mcpOauthPending', {
          state: `state-${i}`,
          clientId: 'client-id',
          redirectUri: callbackUri,
          codeChallenge,
          codeChallengeMethod: 'S256',
          scope: 'blog:read',
          mcpState: '',
          expiresAt: Date.now() + 60_000,
        });
      }
    });

    const result = await t.mutation(internal.mcp.internal.createPending, {
      state: 'over-limit',
      clientId: 'client-id',
      redirectUri: callbackUri,
      codeChallenge,
      codeChallengeMethod: 'S256',
      scope: 'blog:read',
      mcpState: '',
      expiresAt: Date.now() + 60_000,
      requesterKey: 'requester-a',
    });
    expect(result.error).toBe('too_many_pending');
  });

  it('createPending_isolatesActiveLimitsByRequester', async () => {
    const t = convexTest(schema, modules);
    const expiresAt = Date.now() + 60_000;
    await t.run(async (ctx) => {
      for (let i = 0; i < 10; i++) {
        await ctx.db.insert('mcpOauthPending', {
          state: `requester-a-${i}`,
          clientId: 'client-id',
          redirectUri: callbackUri,
          codeChallenge,
          codeChallengeMethod: 'S256',
          scope: 'blog:read',
          mcpState: '',
          expiresAt,
          requesterKey: 'requester-a',
        });
      }
    });

    const sameRequester = await t.mutation(internal.mcp.internal.createPending, {
      state: 'requester-a-limited',
      clientId: 'client-id',
      redirectUri: callbackUri,
      codeChallenge,
      codeChallengeMethod: 'S256',
      scope: 'blog:read',
      mcpState: '',
      expiresAt,
      requesterKey: 'requester-a',
    });
    const otherRequester = await t.mutation(internal.mcp.internal.createPending, {
      state: 'requester-b-allowed',
      clientId: 'client-id',
      redirectUri: callbackUri,
      codeChallenge,
      codeChallengeMethod: 'S256',
      scope: 'blog:read',
      mcpState: '',
      expiresAt,
      requesterKey: 'requester-b',
    });

    expect(sameRequester.error).toBe('too_many_pending');
    expect(otherRequester.error).toBeUndefined();
  });

  it('handleAuthorize_defaultsMissingScopeToRead', async () => {
    process.env.CONVEX_SITE_URL = 'https://example.convex.site';
    process.env.GOOGLE_CLIENT_ID = 'google-client';
    const runMutation = vi.fn(async () => ({ id: 'pending-id' }));
    const ctx = {
      runQuery: vi.fn(async () => ({ redirectUris: [callbackUri] })),
      runMutation,
      meta: {
        getRequestMetadata: vi.fn(async () => ({ ip: '203.0.113.1' })),
      },
    } as unknown as ActionCtx;
    const url = new URL('https://example.convex.site/oauth/authorize');
    url.searchParams.set('client_id', 'client-1');
    url.searchParams.set('redirect_uri', callbackUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');

    const response = await handleAuthorize(ctx, new Request(url));

    expect(response.status).toBe(302);
    expect(runMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        scope: 'blog:read',
        requesterKey: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );
  });

  it('handleCallback_requiresEscapedSiteConsentAfterAdminAuthentication', async () => {
    process.env.CONVEX_SITE_URL = 'https://example.convex.site';
    process.env.GOOGLE_CLIENT_ID = 'google-client';
    process.env.GOOGLE_CLIENT_SECRET = 'google-secret';
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ access_token: 'google-access-token' }))
        .mockResolvedValueOnce(Response.json({ email: 'admin@example.com', email_verified: true }))
    );

    const pending = {
      _id: 'pending-id',
      clientId: 'client-id',
      redirectUri: callbackUri,
      codeChallenge,
      scope: 'blog:read blog:write',
      mcpState: 'mcp-state',
      expiresAt: Date.now() + 60_000,
    };
    const runQuery = vi
      .fn()
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce({ _id: 'admin-id', role: 'admin' })
      .mockResolvedValueOnce({ clientId: 'client-id', clientName: '<script>bad()</script>' });
    const runMutation = vi.fn(async () => ({ ok: true }));
    const ctx = { runQuery, runMutation } as unknown as ActionCtx;

    const response = await handleCallback(
      ctx,
      new Request(
        'https://example.convex.site/oauth/callback?code=google-code&state=google-state&decision=approve'
      )
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(html).toContain('&lt;script&gt;bad()&lt;/script&gt;');
    expect(html).not.toContain('<script>bad()</script>');
    expect(html).toContain('<code>blog:read</code>');
    expect(html).toContain('<code>blog:write</code>');
    expect(html).toContain(
      '<form method="post" action="https://example.convex.site/oauth/consent">'
    );
    expect(response.headers.get('Content-Security-Policy')).toBe(
      "default-src 'none'; base-uri 'none'; frame-ancestors 'none'"
    );
    expect(runMutation).toHaveBeenCalledTimes(1);
  });

  it('handleConsent_approvalAndDenialRedirectWithOAuthResults', async () => {
    const approvedCtx = {
      runMutation: vi.fn(async () => ({
        redirectUri: `${callbackUri}?existing=1`,
        mcpState: 'state-1',
        approved: true,
      })),
    } as unknown as ActionCtx;
    const approved = await handleConsent(
      approvedCtx,
      new Request('https://example.convex.site/oauth/consent', {
        method: 'POST',
        body: new URLSearchParams({
          state: 'pending-state',
          consent_token: 'consent-token',
          decision: 'approve',
        }),
      })
    );
    const approvedLocation = new URL(approved.headers.get('Location')!);
    expect(approved.status).toBe(302);
    expect(approvedLocation.searchParams.get('existing')).toBe('1');
    expect(approvedLocation.searchParams.get('code')).toBeTruthy();
    expect(approvedLocation.searchParams.get('state')).toBe('state-1');

    const deniedCtx = {
      runMutation: vi.fn(async () => ({
        redirectUri: callbackUri,
        mcpState: 'state-2',
        approved: false,
      })),
    } as unknown as ActionCtx;
    const denied = await handleConsent(
      deniedCtx,
      new Request('https://example.convex.site/oauth/consent', {
        method: 'POST',
        body: new URLSearchParams({
          state: 'pending-state',
          consent_token: 'consent-token',
          decision: 'deny',
        }),
      })
    );
    const deniedLocation = new URL(denied.headers.get('Location')!);
    expect(deniedLocation.searchParams.get('error')).toBe('access_denied');
    expect(deniedLocation.searchParams.get('code')).toBeNull();
    expect(deniedLocation.searchParams.get('state')).toBe('state-2');
  });

  it('completeConsent_consumesPendingAndIssuesOneCode', async () => {
    const t = convexTest(schema, modules);
    const consentToken = await hashToken('raw-consent-token');
    const userId = await t.run(async (ctx) => {
      const id = await ctx.db.insert('users', { email: 'admin@test.com', role: 'admin' });
      await ctx.db.insert('mcpOauthPending', {
        state: 'pending-state',
        clientId: 'client-id',
        redirectUri: callbackUri,
        codeChallenge,
        codeChallengeMethod: 'S256',
        scope: 'blog:read',
        mcpState: 'mcp-state',
        userId: id,
        consentToken,
        expiresAt: Date.now() + 60_000,
      });
      return id;
    });

    const first = await t.mutation(internal.mcp.internal.completeConsent, {
      state: 'pending-state',
      consentToken,
      approved: true,
      code: 'code-hash',
      codeExpiresAt: Date.now() + 60_000,
    });
    const replay = await t.mutation(internal.mcp.internal.completeConsent, {
      state: 'pending-state',
      consentToken,
      approved: true,
      code: 'second-code-hash',
      codeExpiresAt: Date.now() + 60_000,
    });

    expect(first.approved).toBe(true);
    expect(replay.error).toBe('invalid_request');
    await t.run(async (ctx) => {
      const codes = await ctx.db.query('mcpOauthCodes').collect();
      const pending = await ctx.db.query('mcpOauthPending').collect();
      expect(codes).toHaveLength(1);
      expect(codes[0]!.userId).toEqual(userId);
      expect(pending).toHaveLength(0);
    });
  });
});
