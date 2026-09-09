import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { auth } from './auth';
import { handleMcpPost } from './mcp/http';
import {
  handleProtectedResourceMetadata,
  handleAuthServerMetadata,
  handleRegister,
  handleAuthorize,
  handleCallback,
  handleConsent,
  handleToken,
} from './mcp/oauth';

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
  path: '/oauth/consent',
  method: 'POST',
  handler: httpAction(handleConsent),
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
  handler: httpAction(handleMcpPost),
});

export default http;
