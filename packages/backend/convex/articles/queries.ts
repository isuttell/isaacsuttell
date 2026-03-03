import { v } from 'convex/values';
import { query, type QueryCtx } from '../_generated/server';

function isActiveArticle<T extends { deletedAt?: number }>(a: T): boolean {
  return a.deletedAt === undefined;
}

async function getArchivedTagSlugs(ctx: QueryCtx): Promise<Set<string>> {
  const archived = await ctx.db
    .query('tags')
    .withIndex('by_deletedAt', (q) => q.gte('deletedAt', 0))
    .collect();
  return new Set(archived.map((t) => t.slug));
}

function filterTags(tags: string[], archivedSlugs: Set<string>): string[] {
  if (archivedSlugs.size === 0) return tags;
  return tags.filter((t) => !archivedSlugs.has(t));
}

export const list = query({
  args: {
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    let articles = await ctx.db
      .query('articles')
      .withIndex('by_status_and_publishedAt', (q) =>
        q.eq('status', 'published').lte('publishedAt', Date.now())
      )
      .order('desc')
      .collect();

    articles = articles.filter(isActiveArticle);

    if (args.tag) {
      articles = articles.filter((a) => a.tags.includes(args.tag!));
    }

    const archivedSlugs = await getArchivedTagSlugs(ctx);
    return articles.slice(0, limit).map(({ content: _, ...rest }) => ({
      ...rest,
      tags: filterTags(rest.tags, archivedSlugs),
    }));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query('articles')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();

    if (!article || !isActiveArticle(article)) return null;

    if (
      article.status !== 'published' ||
      !article.publishedAt ||
      article.publishedAt > Date.now()
    ) {
      return null;
    }

    const archivedSlugs = await getArchivedTagSlugs(ctx);
    return { ...article, tags: filterTags(article.tags, archivedSlugs) };
  },
});
