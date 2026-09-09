import type { ActionCtx } from '../_generated/server';
import { McpAuthError, validateBearerToken } from './auth';
import { handleMcpRequest } from './handler';
import { readBoundedBody } from './request-body';

// Allows worst-case JSON escaping of the 750,000-byte article-content contract.
const MAX_MCP_BODY_BYTES = 5 * 1024 * 1024;

function jsonRpcErrorResponse(
  id: string | number | null,
  code: number,
  message: string,
  status: number
): Response {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleMcpPost(ctx: ActionCtx, request: Request): Promise<Response> {
  try {
    const auth = await validateBearerToken(ctx, request);
    const rawBody = await readBoundedBody(request, MAX_MCP_BODY_BYTES);
    if (rawBody === null) {
      return jsonRpcErrorResponse(null, -32000, 'Request body is too large', 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return jsonRpcErrorResponse(null, -32700, 'Parse error', 400);
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return jsonRpcErrorResponse(null, -32600, 'Invalid request: expected a JSON object', 400);
    }

    const response = await handleMcpRequest(ctx, body, auth);
    if (response === null) return new Response(null, { status: 202 });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof McpAuthError) {
      const siteUrl = process.env.CONVEX_SITE_URL ?? '';
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32000, message: error.message },
        }),
        {
          status: error.status,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': `Bearer resource_metadata="${siteUrl}/.well-known/oauth-protected-resource"`,
          },
        }
      );
    }

    return jsonRpcErrorResponse(null, -32603, 'Internal server error', 500);
  }
}
