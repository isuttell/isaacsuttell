import type { ActionCtx } from '../_generated/server';
import type { McpAuthContext } from './auth';
import { TOOLS, executeTool } from './tools';
import { internal } from '../_generated/api';

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = { name: 'isaacsuttell-blog', version: '0.1.0' };

const READ_TOOLS = new Set([
  'blog_list_articles',
  'blog_get_article',
  'blog_list_tags',
  'blog_list_article_versions',
  'blog_get_article_version',
  'blog_list_archived_articles',
  'blog_list_archived_tags',
]);
const WRITE_TOOLS = new Set([
  'blog_create_article',
  'blog_update_article',
  'blog_find_replace_article',
  'blog_publish_article',
  'blog_unpublish_article',
  'blog_restore_article',
  'blog_restore_article_version',
  'blog_create_tag',
  'blog_restore_tag',
]);
const DELETE_TOOLS = new Set(['blog_delete_article', 'blog_delete_tag']);

function hasScope(scopes: string[], required: string): boolean {
  if (scopes.includes('blog:manage')) return true;
  return scopes.includes(required);
}

function toolRequiresScope(toolName: string): { scope: string; ok: boolean } {
  if (READ_TOOLS.has(toolName)) return { scope: 'blog:read', ok: true };
  if (WRITE_TOOLS.has(toolName)) return { scope: 'blog:write', ok: true };
  if (DELETE_TOOLS.has(toolName)) return { scope: 'blog:delete', ok: true };
  return { scope: '', ok: false };
}

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string };
}

/**
 * Handle an MCP JSON-RPC request. Returns a JSON-RPC response object,
 * or null for notifications (which get HTTP 202).
 */
export async function handleMcpRequest(
  ctx: ActionCtx,
  body: unknown,
  auth: McpAuthContext
): Promise<JsonRpcResponse | null> {
  const req = body as JsonRpcRequest;

  if (req.jsonrpc !== '2.0' || !req.method) {
    return jsonRpcError(req.id ?? null, -32600, 'Invalid JSON-RPC request');
  }

  // Validate id type per JSON-RPC 2.0 spec
  if (
    req.id !== undefined &&
    req.id !== null &&
    typeof req.id !== 'string' &&
    typeof req.id !== 'number'
  ) {
    return jsonRpcError(null, -32600, 'Invalid JSON-RPC id type');
  }

  // Notifications have no id — respond with null (HTTP 202)
  if (req.id === undefined) {
    return null;
  }

  switch (req.method) {
    case 'initialize':
      return jsonRpcResult(req.id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
        instructions:
          'MCP server for managing blog articles on isaacsuttell.com. You can create, edit, publish, unpublish, archive, and restore blog posts. Supports version history, soft-delete recovery, and tag management.',
      });

    case 'tools/list':
      return jsonRpcResult(req.id, { tools: TOOLS });

    case 'tools/call': {
      const params = req.params ?? {};
      const toolName = params.name as string;
      const toolArgs = (params.arguments ?? {}) as Record<string, unknown>;

      if (!toolName) {
        return jsonRpcError(req.id, -32602, 'Missing tool name');
      }

      const tool = TOOLS.find((t) => t.name === toolName);
      if (!tool) {
        return jsonRpcError(req.id, -32602, `Unknown tool: ${toolName}`);
      }

      const { scope: requiredScope, ok } = toolRequiresScope(toolName);
      if (!ok) {
        return jsonRpcError(req.id, -32602, `Unknown tool: ${toolName}`);
      }

      const scopes = auth.scope.split(' ').filter(Boolean);
      if (!hasScope(scopes, requiredScope)) {
        return jsonRpcError(req.id, -32600, `Insufficient scope. Tool requires ${requiredScope}.`);
      }

      const user = await ctx.runQuery(internal.users.internal.getById, {
        id: auth.userId,
      });
      if (!user || user.role !== 'admin') {
        return jsonRpcError(req.id, -32600, 'Access denied: user is not an admin');
      }

      const result = await executeTool(ctx, toolName, toolArgs, auth.userId);
      return jsonRpcResult(req.id, result);
    }

    default:
      return jsonRpcError(req.id, -32601, `Method not found: ${req.method}`);
  }
}

function jsonRpcResult(id: string | number | null, result: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, result };
}

function jsonRpcError(id: string | number | null, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error: { code, message } };
}
