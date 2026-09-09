import { convexTest } from 'convex-test';
import { expect, describe, it } from 'vitest';
import schema from '../../convex/schema';
import { modules } from '../test_setup';
import { api } from '../../convex/_generated/api';

describe('articles.queries', () => {
  async function seedArticle(
    t: ReturnType<typeof convexTest>,
    overrides: Partial<{
      title: string;
      slug: string;
      status: 'draft' | 'published';
      publishedAt: number;
      tags: string[];
    }> = {}
  ) {
    // Insert a user and article directly for test setup
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert('users', {
        name: 'Test Author',
        role: 'admin',
      });
    });

    const now = Date.now();
    return await t.run(async (ctx) => {
      return await ctx.db.insert('articles', {
        title: overrides.title ?? 'Test Article',
        slug: overrides.slug ?? 'test-article',
        content: '# Hello\n\nThis is test content.',
        excerpt: 'Test excerpt',
        tags: overrides.tags ?? ['test'],
        status: overrides.status ?? 'published',
        publishedAt: overrides.publishedAt ?? now - 1000,
        authorId: userId,
        updatedAt: now,
      });
    });
  }

  it('list_returnsPublishedArticles', async () => {
    const t = convexTest(schema, modules);
    await seedArticle(t, { slug: 'first', title: 'First' });
    await seedArticle(t, { slug: 'second', title: 'Second' });

    const articles = await t.query(api.articles.queries.list, {});
    expect(articles).toHaveLength(2);
  });

  it('list_excludesDrafts', async () => {
    const t = convexTest(schema, modules);
    await seedArticle(t, { slug: 'published-one', status: 'published' });
    await seedArticle(t, { slug: 'draft-one', status: 'draft' });

    const articles = await t.query(api.articles.queries.list, {});
    expect(articles).toHaveLength(1);
    expect(articles[0].slug).toBe('published-one');
  });

  it('list_excludesFutureArticles', async () => {
    const t = convexTest(schema, modules);
    await seedArticle(t, {
      slug: 'past',
      publishedAt: Date.now() - 10000,
    });
    await seedArticle(t, {
      slug: 'future',
      publishedAt: Date.now() + 100000,
    });

    const articles = await t.query(api.articles.queries.list, {});
    expect(articles).toHaveLength(1);
    expect(articles[0].slug).toBe('past');
  });

  it('list_filtersByTag', async () => {
    const t = convexTest(schema, modules);
    await seedArticle(t, { slug: 'js-post', tags: ['javascript'] });
    await seedArticle(t, { slug: 'rust-post', tags: ['rust'] });

    const articles = await t.query(api.articles.queries.list, {
      tag: 'javascript',
    });
    expect(articles).toHaveLength(1);
    expect(articles[0].slug).toBe('js-post');
  });

  it('list_validatesLimitBounds', async () => {
    const t = convexTest(schema, modules);

    for (const limit of [0, 1.5, 101]) {
      await expect(t.query(api.articles.queries.list, { limit })).rejects.toThrow(
        'limit must be an integer between 1 and 100'
      );
    }
  });

  it('list_returnsUpToTheRequestedLimit', async () => {
    const t = convexTest(schema, modules);
    await seedArticle(t, { slug: 'oldest', publishedAt: 1 });
    await seedArticle(t, { slug: 'middle', publishedAt: 2 });
    await seedArticle(t, { slug: 'newest', publishedAt: 3 });

    const articles = await t.query(api.articles.queries.list, { limit: 2 });

    expect(articles.map((article) => article.slug)).toEqual(['newest', 'middle']);
  });

  it('list_excludesArchivedArticlesBeforeApplyingLimit', async () => {
    const t = convexTest(schema, modules);
    const archivedId = await seedArticle(t, {
      slug: 'archived',
      publishedAt: 3,
    });
    await seedArticle(t, { slug: 'active', publishedAt: 2 });
    await t.run(async (ctx) => {
      await ctx.db.patch(archivedId, { deletedAt: Date.now() });
    });

    const articles = await t.query(api.articles.queries.list, { limit: 1 });

    expect(articles).toHaveLength(1);
    expect(articles[0].slug).toBe('active');
  });

  it('list_failsWhenTagFilterCannotProveACompletePage', async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      const authorId = await ctx.db.insert('users', {
        name: 'Test Author',
        role: 'admin',
      });

      for (let publishedAt = 1; publishedAt <= 501; publishedAt += 1) {
        await ctx.db.insert('articles', {
          title: `Article ${publishedAt}`,
          slug: `article-${publishedAt}`,
          content: 'content',
          excerpt: 'excerpt',
          tags: ['other'],
          status: 'published',
          publishedAt,
          authorId,
          updatedAt: publishedAt,
        });
      }
    });

    await expect(t.query(api.articles.queries.list, { tag: 'target', limit: 1 })).rejects.toThrow(
      'Cannot complete tag filter within 500 articles'
    );
  });

  it('list_omitsContentField', async () => {
    const t = convexTest(schema, modules);
    await seedArticle(t);

    const articles = await t.query(api.articles.queries.list, {});
    expect(articles).toHaveLength(1);
    expect('content' in articles[0]).toBe(false);
  });

  it('getBySlug_returnsPublishedArticle', async () => {
    const t = convexTest(schema, modules);
    await seedArticle(t, { slug: 'my-post' });

    const article = await t.query(api.articles.queries.getBySlug, {
      slug: 'my-post',
    });
    expect(article).not.toBeNull();
    expect(article!.title).toBe('Test Article');
    expect(article!.content).toBe('# Hello\n\nThis is test content.');
  });

  it('getBySlug_returnsNullForDraft', async () => {
    const t = convexTest(schema, modules);
    await seedArticle(t, { slug: 'draft-post', status: 'draft' });

    const article = await t.query(api.articles.queries.getBySlug, {
      slug: 'draft-post',
    });
    expect(article).toBeNull();
  });

  it('getBySlug_returnsNullForFuture', async () => {
    const t = convexTest(schema, modules);
    await seedArticle(t, {
      slug: 'future-post',
      publishedAt: Date.now() + 100000,
    });

    const article = await t.query(api.articles.queries.getBySlug, {
      slug: 'future-post',
    });
    expect(article).toBeNull();
  });

  it('getBySlug_returnsNullForNonexistent', async () => {
    const t = convexTest(schema, modules);

    const article = await t.query(api.articles.queries.getBySlug, {
      slug: 'no-such-post',
    });
    expect(article).toBeNull();
  });
});
