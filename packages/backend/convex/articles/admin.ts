import { v, ConvexError } from 'convex/values';
import { query, mutation } from '../_generated/server';
import { paginationOptsValidator } from 'convex/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { requireAdmin } from '../lib/auth';
import { validateSlug } from '../lib/validators';

const EMPTY_PAGE = { page: [] as never[], isDone: true, continueCursor: '' };

export const listAll = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return EMPTY_PAGE;
    const user = await ctx.db.get(userId);
    if (user?.role !== 'admin') return EMPTY_PAGE;

    return await ctx.db.query('articles').order('desc').paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id('articles') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (user?.role !== 'admin') return null;
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    tags: v.array(v.string()),
    status: v.union(v.literal('draft'), v.literal('published')),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authorId = await requireAdmin(ctx);

    validateSlug(args.slug);

    const existing = await ctx.db
      .query('articles')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (existing) throw new ConvexError('Slug already exists');

    if (args.status === 'published' && !args.publishedAt) {
      throw new ConvexError('Published articles must have a publishedAt date');
    }

    return await ctx.db.insert('articles', {
      ...args,
      authorId,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('articles'),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal('draft'), v.literal('published'))),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;

    const article = await ctx.db.get(id);
    if (!article) throw new ConvexError('Article not found');

    if (updates.slug) {
      validateSlug(updates.slug);
      if (updates.slug !== article.slug) {
        const existing = await ctx.db
          .query('articles')
          .withIndex('by_slug', (q) => q.eq('slug', updates.slug!))
          .unique();
        if (existing) throw new ConvexError('Slug already exists');
      }
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }

    const merged = { ...article, ...patch };
    if (merged.status === 'published' && !merged.publishedAt) {
      throw new ConvexError('Published articles must have a publishedAt date');
    }

    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id('articles') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
