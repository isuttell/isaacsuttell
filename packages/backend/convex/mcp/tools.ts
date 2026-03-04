import type { ActionCtx } from '../_generated/server';
import { internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, boolean>;
}

interface ToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

// --- Content Processing ---

const CONTENT_CHAR_THRESHOLD = 5000;
const PREVIEW_LINES = 50;

interface ContentOpts {
  startLine?: number;
  endLine?: number;
  metadataOnly?: boolean;
}

function processContent(
  content: string,
  opts: ContentOpts
): {
  content?: string;
  totalLines: number;
  totalCharacters: number;
  contentRange?: { startLine: number; endLine: number };
  truncated?: boolean;
  hint?: string;
} {
  const lines = content.split('\n');
  const meta = { totalLines: lines.length, totalCharacters: content.length };

  if (opts.metadataOnly) {
    return meta;
  }

  if (opts.startLine !== undefined || opts.endLine !== undefined) {
    const start = Math.max(1, opts.startLine ?? 1);
    const end = Math.min(opts.endLine ?? lines.length, lines.length);
    return {
      content: lines.slice(start - 1, end).join('\n'),
      ...meta,
      contentRange: { startLine: start, endLine: end },
    };
  }

  if (content.length > CONTENT_CHAR_THRESHOLD) {
    const endLine = Math.min(PREVIEW_LINES, lines.length);
    return {
      content: lines.slice(0, endLine).join('\n'),
      ...meta,
      contentRange: { startLine: 1, endLine },
      truncated: true,
      hint: `Content is ${lines.length} lines. Showing first ${endLine}. Use startLine/endLine to fetch more.`,
    };
  }

  return { content, ...meta };
}

// --- Tool Definitions ---

export const TOOLS: ToolDefinition[] = [
  {
    name: 'blog_list_articles',
    description:
      'List blog articles (paginated). Returns title, slug, status, tags, excerpt, dates. Content is excluded for brevity. Use cursor from previous response to get next page.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description: 'Filter by status. Omit for all articles.',
        },
        tag: {
          type: 'string',
          description: 'Filter by tag slug.',
        },
        cursor: {
          type: 'string',
          description: 'Pagination cursor from a previous response. Omit for first page.',
        },
        limit: {
          type: 'number',
          description: 'Max articles per page (default 20, max 100).',
        },
      },
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'blog_get_article',
    description:
      'Get a single article by ID or slug. Returns metadata and content. For large articles, content is auto-truncated — use startLine/endLine to fetch specific sections. Exactly one of id or slug must be provided.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID' },
        slug: { type: 'string', description: 'Article URL slug' },
        startLine: {
          type: 'number',
          description: 'Start line (1-based, inclusive). Omit to start from beginning.',
        },
        endLine: {
          type: 'number',
          description: 'End line (1-based, inclusive). Omit to read to end.',
        },
        metadataOnly: {
          type: 'boolean',
          description: 'If true, return only metadata (no content).',
        },
      },
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'blog_create_article',
    description:
      'Create a new blog article. Defaults to draft status. Slug must be lowercase alphanumeric with hyphens (e.g. "my-first-post").',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Article title' },
        slug: {
          type: 'string',
          description: 'URL slug (lowercase, hyphens, e.g. "my-first-post")',
        },
        content: {
          type: 'string',
          description: 'Article body in Markdown',
        },
        excerpt: {
          type: 'string',
          description: 'Short summary/excerpt',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tag slugs',
          default: [],
        },
      },
      required: ['title', 'slug', 'content', 'excerpt'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'blog_update_article',
    description: 'Update an existing article. Only provided fields are changed.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID of the article' },
        title: { type: 'string', description: 'New title' },
        slug: { type: 'string', description: 'New slug' },
        content: { type: 'string', description: 'New content (Markdown)' },
        excerpt: { type: 'string', description: 'New excerpt' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'New tags (replaces existing)',
        },
      },
      required: ['id'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'blog_publish_article',
    description: 'Publish a draft article. Sets status to "published" and publishedAt to now.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID of the article' },
      },
      required: ['id'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'blog_unpublish_article',
    description: 'Unpublish an article. Reverts to draft status and clears publishedAt.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID of the article' },
      },
      required: ['id'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'blog_delete_article',
    description:
      'Archive (soft-delete) an article. The article is hidden but can be restored with blog_restore_article. Use this instead of permanent delete to allow recovery.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID of the article' },
        reason: { type: 'string', description: 'Optional reason for archiving' },
      },
      required: ['id'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
  },
  {
    name: 'blog_list_archived_articles',
    description:
      'List archived (soft-deleted) articles. Use to find articles that can be restored with blog_restore_article.',
    inputSchema: {
      type: 'object',
      properties: {
        cursor: { type: 'string', description: 'Pagination cursor' },
        limit: { type: 'number', description: 'Max articles per page (default 20)' },
      },
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'blog_restore_article',
    description: 'Restore an archived article. Makes it visible again in lists and editable.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID of the archived article' },
      },
      required: ['id'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'blog_list_article_versions',
    description:
      'List version history for an article. Returns version number, title, status, source, and timestamp. Use blog_restore_article_version to revert to a previous version.',
    inputSchema: {
      type: 'object',
      properties: {
        articleId: { type: 'string', description: 'Convex document ID of the article' },
        limit: { type: 'number', description: 'Max versions to return (default 20)' },
      },
      required: ['articleId'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'blog_get_article_version',
    description:
      'Get details of a specific article version. For large content, auto-truncated — use startLine/endLine to fetch sections. Use blog_list_article_versions first to find version numbers.',
    inputSchema: {
      type: 'object',
      properties: {
        articleId: { type: 'string', description: 'Convex document ID of the article' },
        version: {
          type: 'number',
          description: 'Version number (from blog_list_article_versions)',
        },
        startLine: {
          type: 'number',
          description: 'Start line (1-based, inclusive).',
        },
        endLine: {
          type: 'number',
          description: 'End line (1-based, inclusive).',
        },
        metadataOnly: {
          type: 'boolean',
          description: 'If true, return only metadata (no content).',
        },
      },
      required: ['articleId', 'version'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'blog_restore_article_version',
    description:
      'Revert an article to a previous version. Creates a new revision with the restored content. Use blog_list_article_versions to find the version number.',
    inputSchema: {
      type: 'object',
      properties: {
        articleId: { type: 'string', description: 'Convex document ID of the article' },
        version: {
          type: 'number',
          description: 'Version number to restore (from blog_list_article_versions)',
        },
      },
      required: ['articleId', 'version'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'blog_find_replace_article',
    description:
      'Apply exact string replacements to article content. Pass an array of {find, replace} pairs. All matches are applied in order. Returns the number of replacements made. Prefer this over blog_update_article for targeted content edits.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID of the article' },
        replacements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              find: { type: 'string', description: 'Exact string to find' },
              replace: { type: 'string', description: 'String to replace with' },
            },
            required: ['find', 'replace'],
          },
          description: 'Array of find/replace pairs applied in order',
        },
      },
      required: ['id', 'replacements'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'blog_list_tags',
    description: 'List all available tags.',
    inputSchema: { type: 'object', properties: {} },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'blog_create_tag',
    description: 'Create a new tag. Slug must be lowercase alphanumeric with hyphens.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Display name' },
        slug: {
          type: 'string',
          description: 'URL slug (lowercase, hyphens)',
        },
      },
      required: ['name', 'slug'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  {
    name: 'blog_list_archived_tags',
    description:
      'List archived (soft-deleted) tags. Use to find tags that can be restored with blog_restore_tag.',
    inputSchema: { type: 'object', properties: {} },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: 'blog_delete_tag',
    description:
      'Archive (soft-delete) a tag. The tag is hidden from public views but articles retain the association. Can be restored with blog_restore_tag.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID of the tag' },
      },
      required: ['id'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
  },
  {
    name: 'blog_restore_tag',
    description: 'Restore an archived tag.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID of the archived tag' },
      },
      required: ['id'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
];

// --- Tool Dispatch ---

type ToolArgs = Record<string, unknown>;

export async function executeTool(
  ctx: ActionCtx,
  name: string,
  args: ToolArgs,
  userId: Id<'users'>
): Promise<ToolResult> {
  try {
    const result = await dispatchTool(ctx, name, args, userId);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
}

async function dispatchTool(
  ctx: ActionCtx,
  name: string,
  args: ToolArgs,
  userId: Id<'users'>
): Promise<unknown> {
  switch (name) {
    case 'blog_list_articles': {
      const limit = Math.min(Math.max((args.limit as number) || 20, 1), 100);
      const cursor = (args.cursor as string) || null;
      const results = await ctx.runQuery(internal.articles.internal.listAll, {
        status: args.status as 'draft' | 'published' | undefined,
        tag: args.tag as string | undefined,
        paginationOpts: { numItems: limit, cursor },
      });
      return {
        articles: results.page.map((a) => ({
          _id: a._id,
          title: a.title,
          slug: a.slug,
          status: a.status,
          excerpt: a.excerpt,
          tags: a.tags,
          publishedAt: a.publishedAt,
          updatedAt: a.updatedAt,
        })),
        nextCursor: results.isDone ? null : results.continueCursor,
        isDone: results.isDone,
      };
    }

    case 'blog_get_article': {
      if (!args.id && !args.slug) {
        throw new Error('Either id or slug must be provided');
      }
      if (args.id && args.slug) {
        throw new Error('Provide either id or slug, not both');
      }
      const article = args.id
        ? await ctx.runQuery(internal.articles.internal.getById, {
            id: args.id as Id<'articles'>,
          })
        : await ctx.runQuery(internal.articles.internal.getBySlug, {
            slug: args.slug as string,
          });
      if (!article) throw new Error('Article not found');

      const processed = processContent(article.content, {
        startLine: args.startLine as number | undefined,
        endLine: args.endLine as number | undefined,
        metadataOnly: args.metadataOnly as boolean | undefined,
      });

      return {
        _id: article._id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        tags: article.tags,
        status: article.status,
        publishedAt: article.publishedAt,
        authorId: article.authorId,
        updatedAt: article.updatedAt,
        ...processed,
      };
    }

    case 'blog_create_article': {
      const id = await ctx.runMutation(internal.articles.internal.create, {
        title: args.title as string,
        slug: args.slug as string,
        content: args.content as string,
        excerpt: args.excerpt as string,
        tags: (args.tags as string[]) ?? [],
        status: 'draft' as const,
        authorId: userId,
      });
      const created = await ctx.runQuery(internal.articles.internal.getById, { id });
      return { id, status: 'draft', updatedAt: created!.updatedAt };
    }

    case 'blog_update_article': {
      await ctx.runMutation(internal.articles.internal.update, {
        id: args.id as Id<'articles'>,
        actorId: userId,
        ...(args.title !== undefined && { title: args.title as string }),
        ...(args.slug !== undefined && { slug: args.slug as string }),
        ...(args.content !== undefined && { content: args.content as string }),
        ...(args.excerpt !== undefined && { excerpt: args.excerpt as string }),
        ...(args.tags !== undefined && { tags: args.tags as string[] }),
      });
      const updated = await ctx.runQuery(internal.articles.internal.getById, {
        id: args.id as Id<'articles'>,
      });
      return { updated: true, updatedAt: updated!.updatedAt };
    }

    case 'blog_publish_article': {
      await ctx.runMutation(internal.articles.internal.publish, {
        id: args.id as Id<'articles'>,
        actorId: userId,
      });
      const published = await ctx.runQuery(internal.articles.internal.getById, {
        id: args.id as Id<'articles'>,
      });
      return { published: true, updatedAt: published!.updatedAt };
    }

    case 'blog_unpublish_article': {
      await ctx.runMutation(internal.articles.internal.unpublish, {
        id: args.id as Id<'articles'>,
        actorId: userId,
      });
      const unpublished = await ctx.runQuery(internal.articles.internal.getById, {
        id: args.id as Id<'articles'>,
      });
      return { unpublished: true, updatedAt: unpublished!.updatedAt };
    }

    case 'blog_delete_article': {
      await ctx.runMutation(internal.articles.internal.archive, {
        id: args.id as Id<'articles'>,
        actorId: userId,
        reason: args.reason as string | undefined,
      });
      return { archived: true };
    }

    case 'blog_list_archived_articles': {
      const limit = Math.min(Math.max((args.limit as number) || 20, 1), 100);
      const cursor = (args.cursor as string) || null;
      const results = await ctx.runQuery(internal.articles.internal.listArchived, {
        paginationOpts: { numItems: limit, cursor },
      });
      return {
        articles: results.page.map((a) => ({
          _id: a._id,
          title: a.title,
          slug: a.slug,
          status: a.status,
          excerpt: a.excerpt,
          tags: a.tags,
          updatedAt: a.updatedAt,
          deletedAt: a.deletedAt,
          deleteReason: a.deleteReason,
        })),
        nextCursor: results.isDone ? null : results.continueCursor,
        isDone: results.isDone,
      };
    }

    case 'blog_restore_article': {
      await ctx.runMutation(internal.articles.internal.restore, {
        id: args.id as Id<'articles'>,
      });
      const restored = await ctx.runQuery(internal.articles.internal.getById, {
        id: args.id as Id<'articles'>,
      });
      return { restored: true, updatedAt: restored!.updatedAt };
    }

    case 'blog_list_article_versions': {
      const limit = Math.min(Math.max((args.limit as number) || 20, 1), 50);
      const versions = await ctx.runQuery(internal.articles.internal.listVersions, {
        articleId: args.articleId as Id<'articles'>,
        limit,
      });
      return {
        versions: versions.map((v) => ({
          version: v.version,
          title: v.snapshot.title,
          slug: v.snapshot.slug,
          status: v.snapshot.status,
          updatedAt: v.snapshot.updatedAt,
          source: v.source,
          reason: v.reason,
        })),
      };
    }

    case 'blog_get_article_version': {
      const versionDoc = await ctx.runQuery(internal.articles.internal.getVersion, {
        articleId: args.articleId as Id<'articles'>,
        version: args.version as number,
      });
      if (!versionDoc) throw new Error('Version not found');

      const s = versionDoc.snapshot;
      const processed = processContent(s.content, {
        startLine: args.startLine as number | undefined,
        endLine: args.endLine as number | undefined,
        metadataOnly: args.metadataOnly as boolean | undefined,
      });

      return {
        version: versionDoc.version,
        source: versionDoc.source,
        reason: versionDoc.reason,
        title: s.title,
        slug: s.slug,
        excerpt: s.excerpt,
        tags: s.tags,
        status: s.status,
        publishedAt: s.publishedAt,
        updatedAt: s.updatedAt,
        ...processed,
      };
    }

    case 'blog_restore_article_version': {
      await ctx.runMutation(internal.articles.internal.restoreVersion, {
        articleId: args.articleId as Id<'articles'>,
        version: args.version as number,
        actorId: userId,
      });
      const restoredArticle = await ctx.runQuery(internal.articles.internal.getById, {
        id: args.articleId as Id<'articles'>,
      });
      return { restored: true, updatedAt: restoredArticle!.updatedAt };
    }

    case 'blog_find_replace_article': {
      const article = await ctx.runQuery(internal.articles.internal.getById, {
        id: args.id as Id<'articles'>,
      });
      if (!article) throw new Error('Article not found');

      const replacements = args.replacements as Array<{ find: string; replace: string }>;
      let content = article.content;
      let totalReplaced = 0;

      for (const { find, replace } of replacements) {
        let count = 0;
        let idx = content.indexOf(find);
        while (idx !== -1) {
          content = content.slice(0, idx) + replace + content.slice(idx + find.length);
          count++;
          idx = content.indexOf(find, idx + replace.length);
        }
        totalReplaced += count;
      }

      if (totalReplaced === 0) {
        return { replaced: 0 };
      }

      await ctx.runMutation(internal.articles.internal.update, {
        id: args.id as Id<'articles'>,
        actorId: userId,
        content,
      });
      const updated = await ctx.runQuery(internal.articles.internal.getById, {
        id: args.id as Id<'articles'>,
      });
      return { replaced: totalReplaced, updatedAt: updated!.updatedAt };
    }

    case 'blog_list_tags': {
      const tags = await ctx.runQuery(internal.tags.internal.list, {});
      return tags.map((t) => ({ _id: t._id, name: t.name, slug: t.slug }));
    }

    case 'blog_list_archived_tags': {
      const tags = await ctx.runQuery(internal.tags.internal.listArchived, {});
      return tags.map((t) => ({
        _id: t._id,
        name: t.name,
        slug: t.slug,
        deletedAt: t.deletedAt,
      }));
    }

    case 'blog_create_tag': {
      const id = await ctx.runMutation(internal.tags.internal.create, {
        name: args.name as string,
        slug: args.slug as string,
      });
      return { id };
    }

    case 'blog_delete_tag': {
      await ctx.runMutation(internal.tags.internal.archive, {
        id: args.id as Id<'tags'>,
        actorId: userId,
      });
      return { archived: true };
    }

    case 'blog_restore_tag': {
      await ctx.runMutation(internal.tags.internal.restore, {
        id: args.id as Id<'tags'>,
      });
      return { restored: true };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
