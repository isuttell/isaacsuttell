import { v, ConvexError } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { internalQuery, internalMutation } from '../_generated/server';
import { validateSlug } from '../lib/validators';

export const listAll = internalQuery({
  args: {
    status: v.optional(v.union(v.literal('draft'), v.literal('published'))),
    tag: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let query;
    if (args.status) {
      query = ctx.db
        .query('articles')
        .withIndex('by_status_and_publishedAt', (q) => q.eq('status', args.status!))
        .order('desc');
    } else {
      query = ctx.db.query('articles').order('desc');
    }

    const results = await query.paginate(args.paginationOpts);

    if (args.tag) {
      return {
        ...results,
        page: results.page.filter((a) => a.tags.includes(args.tag!)),
      };
    }

    return results;
  },
});

export const getById = internalQuery({
  args: { id: v.id('articles') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('articles')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
  },
});

export const create = internalMutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    tags: v.array(v.string()),
    status: v.union(v.literal('draft'), v.literal('published')),
    publishedAt: v.optional(v.number()),
    authorId: v.id('users'),
  },
  handler: async (ctx, args) => {
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
      updatedAt: Date.now(),
    });
  },
});

export const update = internalMutation({
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

export const publish = internalMutation({
  args: { id: v.id('articles') },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) throw new ConvexError('Article not found');
    await ctx.db.patch(args.id, {
      status: 'published' as const,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const unpublish = internalMutation({
  args: { id: v.id('articles') },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) throw new ConvexError('Article not found');
    await ctx.db.patch(args.id, {
      status: 'draft' as const,
      publishedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const remove = internalMutation({
  args: { id: v.id('articles') },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) throw new ConvexError('Article not found');
    await ctx.db.delete(args.id);
  },
});
