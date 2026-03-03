import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { auth } from './auth';
import { validateBearerToken, McpAuthError } from './mcp/auth';
import { handleMcpRequest } from './mcp/handler';
import {
  handleProtectedResourceMetadata,
  handleAuthServerMetadata,
  handleRegister,
  handleAuthorize,
  handleCallback,
  handleToken,
} from './mcp/oauth';

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

const http = httpRouter();
auth.addHttpRoutes(http);

// --- OAuth 2.1 Discovery ---

http.route({
  path: '/.well-known/oauth-protected-resource',
  method: 'GET',
  handler: httpAction(async () => handleProtectedResourceMetadata()),
});

http.route({
  path: '/.well-known/oauth-authorization-server',
  method: 'GET',
  handler: httpAction(async () => handleAuthServerMetadata()),
});

// --- OAuth 2.1 Endpoints ---

http.route({
  path: '/oauth/register',
  method: 'POST',
  handler: httpAction(handleRegister),
});

http.route({
  path: '/oauth/authorize',
  method: 'GET',
  handler: httpAction(handleAuthorize),
});

http.route({
  path: '/oauth/callback',
  method: 'GET',
  handler: httpAction(handleCallback),
});

http.route({
  path: '/oauth/token',
  method: 'POST',
  handler: httpAction(handleToken),
});

// --- MCP Endpoint ---

http.route({
  path: '/mcp',
  method: 'GET',
  handler: httpAction(async () => {
    return new Response(null, {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }),
});

http.route({
  path: '/mcp',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      const auth = await validateBearerToken(ctx, request);

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonRpcErrorResponse(null, -32700, 'Parse error', 400);
      }

      if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        return jsonRpcErrorResponse(null, -32600, 'Invalid request: expected a JSON object', 400);
      }

      const response = await handleMcpRequest(ctx, body, auth);

      if (response === null) {
        return new Response(null, { status: 202 });
      }

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
  }),
});

export default http;
