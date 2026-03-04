import { v } from 'convex/values';
import { query } from '../_generated/server';

export const list = query({
  args: {
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    // Use index range to filter published articles with publishedAt in the past.
    // publishedAt is the second field in the compound index, so after eq("status")
    // we can use lte() for the range query — no Date.now() or post-filter needed.
    let articles = await ctx.db
      .query('articles')
      .withIndex('by_status_and_publishedAt', (q) =>
        q.eq('status', 'published').lte('publishedAt', Date.now())
      )
      .order('desc')
      .collect();

    if (args.tag) {
      articles = articles.filter((a) => a.tags.includes(args.tag!));
    }

    return articles.slice(0, limit).map(({ content: _, ...rest }) => rest);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query('articles')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();

    if (!article) return null;

    if (
      article.status !== 'published' ||
      !article.publishedAt ||
      article.publishedAt > Date.now()
    ) {
      return null;
    }

    return article;
  },
});
