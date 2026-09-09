import { describe, expect, it, vi } from 'vitest';
import { executeTool } from '../../convex/mcp/tools';
import { handleMcpRequest } from '../../convex/mcp/handler';
import type { ActionCtx } from '../../convex/_generated/server';
import type { Id } from '../../convex/_generated/dataModel';

const userId = 'admin-id' as Id<'users'>;

describe('mcp tool argument security', () => {
  it('blogFindReplace_rejectsEmptyFindBeforeReadingTheArticle', async () => {
    const runQuery = vi.fn();
    const result = await executeTool(
      { runQuery } as unknown as ActionCtx,
      'blog_find_replace_article',
      { id: 'article-id', replacements: [{ find: '', replace: 'x' }] },
      userId
    );

    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('find must be a non-empty string');
    expect(runQuery).not.toHaveBeenCalled();
  });

  it('blogFindReplace_rejectsMalformedReplacementObjects', async () => {
    const runQuery = vi.fn();
    const result = await executeTool(
      { runQuery } as unknown as ActionCtx,
      'blog_find_replace_article',
      { id: 'article-id', replacements: [null] },
      userId
    );

    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('replacements[0] must be an object');
    expect(runQuery).not.toHaveBeenCalled();
  });

  it('blogFindReplace_terminatesWhenReplacementContainsFind', async () => {
    const runQuery = vi
      .fn()
      .mockResolvedValueOnce({ content: 'a', updatedAt: 1 })
      .mockResolvedValueOnce({ updatedAt: 2 });
    const runMutation = vi.fn();
    const result = await executeTool(
      { runQuery, runMutation } as unknown as ActionCtx,
      'blog_find_replace_article',
      { id: 'article-id', replacements: [{ find: 'a', replace: 'aa' }] },
      userId
    );

    expect(result.isError).toBeUndefined();
    expect(JSON.parse(result.content[0]!.text)).toEqual({ replaced: 1, updatedAt: 2 });
    expect(runMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ content: 'aa' })
    );
  });

  it('blogFindReplace_rejectsOutputAboveTheArticleContentLimit', async () => {
    const runQuery = vi.fn().mockResolvedValueOnce({ content: 'a'.repeat(100), updatedAt: 1 });
    const runMutation = vi.fn();
    const result = await executeTool(
      { runQuery, runMutation } as unknown as ActionCtx,
      'blog_find_replace_article',
      { id: 'article-id', replacements: [{ find: 'a', replace: 'b'.repeat(10_000) }] },
      userId
    );

    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain(
      'replacement result must not exceed 750000 UTF-8 bytes'
    );
    expect(runMutation).not.toHaveBeenCalled();
  });

  it('blogFindReplace_checksActualUtf8SizeAfterReplacement', async () => {
    const runQuery = vi
      .fn()
      .mockResolvedValueOnce({ content: `😀${'x'.repeat(749_996)}`, updatedAt: 1 });
    const runMutation = vi.fn();
    const result = await executeTool(
      { runQuery, runMutation } as unknown as ActionCtx,
      'blog_find_replace_article',
      { id: 'article-id', replacements: [{ find: '\ud83d', replace: 'aa' }] },
      userId
    );

    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain(
      'replacement result must not exceed 750000 UTF-8 bytes'
    );
    expect(runMutation).not.toHaveBeenCalled();
  });

  it('toolsCall_rejectsNonObjectArgumentsBeforeAuthorizationQueries', async () => {
    const runQuery = vi.fn();
    const result = await handleMcpRequest(
      { runQuery } as unknown as ActionCtx,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'blog_find_replace_article', arguments: [] },
      },
      { userId, scope: 'blog:write' }
    );

    expect(result).toEqual({
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32602, message: 'Tool arguments must be an object' },
    });
    expect(runQuery).not.toHaveBeenCalled();
  });
});
