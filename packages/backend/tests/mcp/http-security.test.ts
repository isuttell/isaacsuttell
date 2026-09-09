import { describe, expect, it, vi } from 'vitest';
import type { ActionCtx } from '../../convex/_generated/server';
import type { Id } from '../../convex/_generated/dataModel';
import { handleMcpPost } from '../../convex/mcp/http';

const userId = 'admin-id' as Id<'users'>;

function authenticatedContext() {
  return {
    runQuery: vi.fn(async () => ({
      userId,
      scope: 'blog:read',
      expiresAt: Date.now() + 60_000,
    })),
  } as unknown as ActionCtx;
}

describe('mcp http security', () => {
  it('rejectsOversizedBodiesAfterAuthenticationBeforeDispatch', async () => {
    const ctx = authenticatedContext();
    const declared = await handleMcpPost(
      ctx,
      new Request('https://example.convex.site/mcp', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer access-token',
          'Content-Length': String(5 * 1024 * 1024 + 1),
        },
        body: '{}',
      })
    );
    const streamed = await handleMcpPost(
      ctx,
      new Request('https://example.convex.site/mcp', {
        method: 'POST',
        headers: { Authorization: 'Bearer access-token' },
        body: 'x'.repeat(5 * 1024 * 1024 + 1),
      })
    );

    expect(declared.status).toBe(413);
    expect(streamed.status).toBe(413);
    expect(await declared.json()).toEqual({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32000, message: 'Request body is too large' },
    });
  });

  it('acceptsAnInitializeRequestBelowTheLimit', async () => {
    const response = await handleMcpPost(
      authenticatedContext(),
      new Request('https://example.convex.site/mcp', {
        method: 'POST',
        headers: { Authorization: 'Bearer access-token' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
      })
    );
    const body = (await response.json()) as { result?: { protocolVersion?: string } };

    expect(response.status).toBe(200);
    expect(body.result?.protocolVersion).toBe('2025-06-18');
  });
});
