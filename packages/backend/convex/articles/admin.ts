import { v, ConvexError } from 'convex/values';
import { query, mutation } from '../_generated/server';
import { paginationOptsValidator } from 'convex/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { requireAdmin } from '../lib/auth';
import { validateSlug } from '../lib/validators';
import { captureAndPrune } from './_model';

function isActiveArticle<T extends { deletedAt?: number }>(a: T): boolean {
  return a.deletedAt === undefined;
}

const EMPTY_PAGE = { page: [] as never[], isDone: true, continueCursor: '' };

export const listAll = query({
  args: {
    paginationOpts: paginationOptsValidator,
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return EMPTY_PAGE;
    const user = await ctx.db.get(userId);
    if (user?.role !== 'admin') return EMPTY_PAGE;

    const results = await ctx.db.query('articles').order('desc').paginate(args.paginationOpts);
    const page = args.includeArchived ? results.page : results.page.filter(isActiveArticle);
    return { ...results, page };
  },
});

export const getById = query({
  args: {
    id: v.id('articles'),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (user?.role !== 'admin') return null;
    const article = await ctx.db.get(args.id);
    if (!article) return null;
    if (!args.includeArchived && !isActiveArticle(article)) return null;
    return article;
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

    const id = await ctx.db.insert('articles', {
      ...args,
      authorId,
      updatedAt: Date.now(),
    });
    const article = (await ctx.db.get(id))!;
    await captureAndPrune(ctx, article, authorId, 'admin', undefined);
    return id;
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
    expectedUpdatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authorId = await requireAdmin(ctx);
    const { id, expectedUpdatedAt, ...updates } = args;

    const article = await ctx.db.get(id);
    if (!article) throw new ConvexError('Article not found');
    if (!isActiveArticle(article)) throw new ConvexError('Article is archived');

    if (expectedUpdatedAt !== undefined && article.updatedAt !== expectedUpdatedAt) {
      throw new ConvexError('Article was modified since last read. Refresh and retry.');
    }

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

    await captureAndPrune(ctx, article, authorId, 'admin', undefined);

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
  args: { id: v.id('articles'), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actorId = await requireAdmin(ctx);

    const article = await ctx.db.get(args.id);
    if (!article) throw new ConvexError('Article not found');
    if (!isActiveArticle(article)) throw new ConvexError('Article is already archived');

    await captureAndPrune(ctx, article, actorId, 'admin', args.reason);

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: actorId,
      deleteReason: args.reason,
      updatedAt: Date.now(),
    });
  },
});

export const listVersions = query({
  args: { articleId: v.id('articles'), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (user?.role !== 'admin') return [];

    const limit = args.limit ?? 50;
    return await ctx.db
      .query('articleVersions')
      .withIndex('by_articleId_and_version', (q) => q.eq('articleId', args.articleId))
      .order('desc')
      .take(limit);
  },
});

export const restoreVersion = mutation({
  args: { articleId: v.id('articles'), version: v.number() },
  handler: async (ctx, args) => {
    const actorId = await requireAdmin(ctx);

    const article = await ctx.db.get(args.articleId);
    if (!article) throw new ConvexError('Article not found');
    if (!isActiveArticle(article)) throw new ConvexError('Article is archived; restore it first');

    const versionDoc = await ctx.db
      .query('articleVersions')
      .withIndex('by_articleId_and_version', (q) =>
        q.eq('articleId', args.articleId).eq('version', args.version)
      )
      .unique();
    if (!versionDoc) throw new ConvexError('Version not found');

    const s = versionDoc.snapshot;

    if (s.slug !== article.slug) {
      validateSlug(s.slug);
      const existing = await ctx.db
        .query('articles')
        .withIndex('by_slug', (q) => q.eq('slug', s.slug))
        .unique();
      if (existing && existing._id !== args.articleId) {
        throw new ConvexError(`Cannot restore: slug "${s.slug}" is now used by another article`);
      }
    }

    await captureAndPrune(ctx, article, actorId, 'admin', `restore to v${args.version}`);

    await ctx.db.patch(args.articleId, {
      title: s.title,
      slug: s.slug,
      content: s.content,
      excerpt: s.excerpt,
      tags: s.tags,
      status: s.status,
      publishedAt: s.publishedAt,
      updatedAt: Date.now(),
    });
  },
});
