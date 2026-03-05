import { v, ConvexError } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { internalQuery, internalMutation } from '../_generated/server';
import { validateSlug } from '../lib/validators';
import { captureAndPrune, ARTICLE_CONFLICT } from './model';

function isActiveArticle<T extends { deletedAt?: number }>(a: T): boolean {
  return a.deletedAt === undefined;
}

export const listAll = internalQuery({
  args: {
    status: v.optional(v.union(v.literal('draft'), v.literal('published'))),
    tag: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
    includeArchived: v.optional(v.boolean()),
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

    let page = results.page;
    if (!args.includeArchived) {
      page = page.filter(isActiveArticle);
    }
    if (args.tag) {
      page = page.filter((a) => a.tags.includes(args.tag!));
    }

    return { ...results, page };
  },
});

export const listArchived = internalQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query('articles')
      .withIndex('by_deletedAt', (q) => q.gte('deletedAt', 0))
      .order('desc')
      .paginate(args.paginationOpts);
    return results;
  },
});

export const getById = internalQuery({
  args: {
    id: v.id('articles'),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) return null;
    if (!args.includeArchived && !isActiveArticle(article)) return null;
    return article;
  },
});

export const getBySlug = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query('articles')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (!article || !isActiveArticle(article)) return null;
    return article;
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

    const id = await ctx.db.insert('articles', {
      ...args,
      updatedAt: Date.now(),
    });
    const article = (await ctx.db.get(id))!;
    await captureAndPrune(ctx, article, args.authorId, 'internal', undefined);
    return id;
  },
});

export const update = internalMutation({
  args: {
    id: v.id('articles'),
    actorId: v.id('users'),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal('draft'), v.literal('published'))),
    publishedAt: v.optional(v.number()),
    expectedUpdatedAt: v.optional(v.number()),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, actorId, expectedUpdatedAt, force, ...updates } = args;

    const article = await ctx.db.get(id);
    if (!article) throw new ConvexError('Article not found');
    if (!isActiveArticle(article)) throw new ConvexError('Article is archived');

    if (!force && expectedUpdatedAt !== undefined && article.updatedAt !== expectedUpdatedAt) {
      throw new ConvexError({
        message: 'Article was modified since last read. Refresh and resolve conflicts.',
        code: ARTICLE_CONFLICT,
        serverUpdatedAt: article.updatedAt,
        serverArticle: {
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          tags: article.tags,
          status: article.status,
          publishedAt: article.publishedAt,
        },
      });
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

    await captureAndPrune(ctx, article, actorId, 'internal', force ? 'force overwrite' : undefined);

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
  args: { id: v.id('articles'), actorId: v.id('users') },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) throw new ConvexError('Article not found');
    if (!isActiveArticle(article)) throw new ConvexError('Article is archived');

    await captureAndPrune(ctx, article, args.actorId, 'internal', undefined);

    await ctx.db.patch(args.id, {
      status: 'published' as const,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const unpublish = internalMutation({
  args: { id: v.id('articles'), actorId: v.id('users') },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) throw new ConvexError('Article not found');
    if (!isActiveArticle(article)) throw new ConvexError('Article is archived');

    await captureAndPrune(ctx, article, args.actorId, 'internal', undefined);

    await ctx.db.patch(args.id, {
      status: 'draft' as const,
      publishedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const archive = internalMutation({
  args: {
    id: v.id('articles'),
    actorId: v.id('users'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) throw new ConvexError('Article not found');
    if (!isActiveArticle(article)) throw new ConvexError('Article is already archived');

    await captureAndPrune(ctx, article, args.actorId, 'internal', args.reason);

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: args.actorId,
      deleteReason: args.reason,
      updatedAt: Date.now(),
    });
  },
});

export const restore = internalMutation({
  args: { id: v.id('articles') },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) throw new ConvexError('Article not found');
    if (isActiveArticle(article)) throw new ConvexError('Article is not archived');

    await ctx.db.patch(args.id, {
      deletedAt: undefined,
      deletedBy: undefined,
      deleteReason: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const listVersions = internalQuery({
  args: {
    articleId: v.id('articles'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query('articleVersions')
      .withIndex('by_articleId_and_version', (q) => q.eq('articleId', args.articleId))
      .order('desc')
      .take(limit);
  },
});

export const getVersion = internalQuery({
  args: {
    articleId: v.id('articles'),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('articleVersions')
      .withIndex('by_articleId_and_version', (q) =>
        q.eq('articleId', args.articleId).eq('version', args.version)
      )
      .unique();
  },
});

export const restoreVersion = internalMutation({
  args: {
    articleId: v.id('articles'),
    version: v.number(),
    actorId: v.id('users'),
  },
  handler: async (ctx, args) => {
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

    // Validate slug uniqueness if the snapshot has a different slug
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

    await captureAndPrune(ctx, article, args.actorId, 'internal', `restore to v${args.version}`);

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
