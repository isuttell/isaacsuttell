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
      'Get a single article by ID or slug. Returns full content. Exactly one of id or slug must be provided.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID' },
        slug: { type: 'string', description: 'Article URL slug' },
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
    description: 'Permanently delete an article.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Convex document ID of the article' },
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
    name: 'blog_delete_tag',
    description: 'Delete a tag. Automatically removes it from all articles that use it.',
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
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
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
        articles: results.page.map(({ content: _, ...rest }) => rest),
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
      if (args.id) {
        const article = await ctx.runQuery(internal.articles.internal.getById, {
          id: args.id as Id<'articles'>,
        });
        if (!article) throw new Error('Article not found');
        return article;
      }
      const article = await ctx.runQuery(internal.articles.internal.getBySlug, {
        slug: args.slug as string,
      });
      if (!article) throw new Error('Article not found');
      return article;
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
      return { id, status: 'draft' };
    }

    case 'blog_update_article': {
      await ctx.runMutation(internal.articles.internal.update, {
        id: args.id as Id<'articles'>,
        ...(args.title !== undefined && { title: args.title as string }),
        ...(args.slug !== undefined && { slug: args.slug as string }),
        ...(args.content !== undefined && { content: args.content as string }),
        ...(args.excerpt !== undefined && { excerpt: args.excerpt as string }),
        ...(args.tags !== undefined && { tags: args.tags as string[] }),
      });
      return { updated: true };
    }

    case 'blog_publish_article': {
      await ctx.runMutation(internal.articles.internal.publish, {
        id: args.id as Id<'articles'>,
      });
      return { published: true };
    }

    case 'blog_unpublish_article': {
      await ctx.runMutation(internal.articles.internal.unpublish, {
        id: args.id as Id<'articles'>,
      });
      return { unpublished: true };
    }

    case 'blog_delete_article': {
      await ctx.runMutation(internal.articles.internal.remove, {
        id: args.id as Id<'articles'>,
      });
      return { deleted: true };
    }

    case 'blog_list_tags': {
      return await ctx.runQuery(internal.tags.internal.list, {});
    }

    case 'blog_create_tag': {
      const id = await ctx.runMutation(internal.tags.internal.create, {
        name: args.name as string,
        slug: args.slug as string,
      });
      return { id };
    }

    case 'blog_delete_tag': {
      await ctx.runMutation(internal.tags.internal.remove, {
        id: args.id as Id<'tags'>,
      });
      return { deleted: true };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
