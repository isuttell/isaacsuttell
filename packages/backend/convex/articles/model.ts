import type { MutationCtx } from '../_generated/server';
import type { Doc, Id } from '../_generated/dataModel';

export const ARTICLE_CONFLICT = 'ARTICLE_CONFLICT';

const MAX_VERSIONS_PER_ARTICLE = 50;

export type ArticleSnapshot = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: number;
  authorId: Id<'users'>;
  updatedAt: number;
};

function toSnapshot(article: Doc<'articles'>): ArticleSnapshot {
  return {
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt,
    tags: article.tags,
    status: article.status,
    publishedAt: article.publishedAt,
    authorId: article.authorId,
    updatedAt: article.updatedAt,
  };
}

export async function getNextVersion(ctx: MutationCtx, articleId: Id<'articles'>): Promise<number> {
  const latest = await ctx.db
    .query('articleVersions')
    .withIndex('by_articleId_and_version', (q) => q.eq('articleId', articleId))
    .order('desc')
    .first();
  return (latest?.version ?? 0) + 1;
}

export async function captureRevision(
  ctx: MutationCtx,
  article: Doc<'articles'>,
  actorId: Id<'users'>,
  source: string,
  reason?: string
): Promise<void> {
  const version = await getNextVersion(ctx, article._id);
  await ctx.db.insert('articleVersions', {
    articleId: article._id,
    version,
    snapshot: toSnapshot(article),
    actorId,
    source,
    reason,
  });
}

export async function pruneRevisions(
  ctx: MutationCtx,
  articleId: Id<'articles'>,
  maxVersions: number = MAX_VERSIONS_PER_ARTICLE
): Promise<void> {
  // Only read one past the limit — if it exists, delete it
  const versions = await ctx.db
    .query('articleVersions')
    .withIndex('by_articleId_and_version', (q) => q.eq('articleId', articleId))
    .order('desc')
    .take(maxVersions + 1);

  if (versions.length > maxVersions) {
    await ctx.db.delete(versions[versions.length - 1]!._id);
  }
}

export async function captureAndPrune(
  ctx: MutationCtx,
  article: Doc<'articles'>,
  actorId: Id<'users'>,
  source: string,
  reason?: string
): Promise<void> {
  await captureRevision(ctx, article, actorId, source, reason);
  await pruneRevisions(ctx, article._id);
}
