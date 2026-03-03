import type { ActionCtx } from '../_generated/server';
import type { McpAuthContext } from './auth';
import { TOOLS, executeTool } from './tools';

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = { name: 'isaacsuttell-blog', version: '0.1.0' };

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
          'MCP server for managing blog articles on isaacsuttell.com. You can create, edit, publish, unpublish, and delete blog posts, as well as manage tags.',
      });

    case 'tools/list':
      return jsonRpcResult(req.id, { tools: TOOLS });

    case 'tools/call': {
      // Enforce scope
      if (!auth.scope.split(' ').includes('blog:manage')) {
        return jsonRpcError(req.id, -32600, 'Insufficient scope');
      }

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
