import { ConvexError, v } from 'convex/values';
import { query, type QueryCtx } from '../_generated/server';
import { resolveListLimit } from '../lib/listLimit';

const DEFAULT_LIST_LIMIT = 50;
const MAX_TAG_FILTER_SCAN = 500;
const MAX_ARCHIVED_TAGS = 500;

async function getArchivedTagSlugs(ctx: QueryCtx): Promise<Set<string>> {
  const archived = await ctx.db
    .query('tags')
    .withIndex('by_deletedAt', (q) => q.gte('deletedAt', 0))
    .take(MAX_ARCHIVED_TAGS + 1);

  if (archived.length > MAX_ARCHIVED_TAGS) {
    throw new ConvexError(
      `Cannot filter archived tags: more than ${MAX_ARCHIVED_TAGS} are archived`
    );
  }

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
    const limit = resolveListLimit(args.limit, DEFAULT_LIST_LIMIT);
    const publishedArticles = ctx.db
      .query('articles')
      .withIndex('by_status_and_deletedAt_and_publishedAt', (q) =>
        q.eq('status', 'published').eq('deletedAt', undefined).lte('publishedAt', Date.now())
      )
      .order('desc');

    let articles;
    const tag = args.tag;

    if (tag) {
      const scanned = await publishedArticles.take(MAX_TAG_FILTER_SCAN + 1);
      const hasMore = scanned.length > MAX_TAG_FILTER_SCAN;
      articles = scanned
        .slice(0, MAX_TAG_FILTER_SCAN)
        .filter((article) => article.tags.includes(tag));

      if (articles.length < limit && hasMore) {
        throw new ConvexError(`Cannot complete tag filter within ${MAX_TAG_FILTER_SCAN} articles`);
      }

      articles = articles.slice(0, limit);
    } else {
      articles = await publishedArticles.take(limit);
    }

    if (articles.length === 0) return [];

    const archivedSlugs = await getArchivedTagSlugs(ctx);
    return articles.map(({ content: _, ...rest }) => ({
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

    if (!article || article.deletedAt !== undefined) return null;

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
