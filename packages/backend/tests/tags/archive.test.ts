import { convexTest } from 'convex-test';
import { expect, describe, it, vi } from 'vitest';
import schema from '../../convex/schema';
import { modules } from '../test_setup';
import { api } from '../../convex/_generated/api';
import { internal } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

let mockUserId: Id<'users'> | null = null;

vi.mock('@convex-dev/auth/server', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getAuthUserId: async () => mockUserId,
  };
});

describe('tag archive (non-destructive)', () => {
  async function seedAdminUser(t: ReturnType<typeof convexTest>) {
    const id = await t.run(async (ctx) => {
      return await ctx.db.insert('users', {
        name: 'Admin',
        email: 'admin@test.com',
        role: 'admin',
      });
    });
    mockUserId = id;
    return id;
  }

  it('archive_doesNotRemoveTagFromArticles', async () => {
    const t = convexTest(schema, modules);
    const adminId = await seedAdminUser(t);

    // Create a tag and an article using it
    await t.mutation(internal.tags.internal.create, {
      name: 'JavaScript',
      slug: 'javascript',
    });

    const articleId = await t.mutation(api.articles.admin.create, {
      title: 'JS Post',
      slug: 'js-post',
      content: 'c',
      excerpt: 'e',
      tags: ['javascript'],
      status: 'draft',
    });

    // Archive the tag
    const tag = await t.run(async (ctx) => {
      return await ctx.db
        .query('tags')
        .withIndex('by_slug', (q) => q.eq('slug', 'javascript'))
        .unique();
    });
    await t.mutation(internal.tags.internal.archive, {
      id: tag!._id,
      actorId: adminId,
    });

    // Article should still have the tag slug in DB
    const article = await t.query(api.articles.admin.getById, { id: articleId });
    expect(article!.tags).toContain('javascript');
  });

  it('archive_hidesTagFromPublicList', async () => {
    const t = convexTest(schema, modules);
    const adminId = await seedAdminUser(t);

    await t.mutation(internal.tags.internal.create, {
      name: 'Python',
      slug: 'python',
    });

    // Should be visible
    let tags = await t.query(api.tags.queries.list, {});
    expect(tags.some((t) => t.slug === 'python')).toBe(true);

    // Archive it
    const tag = await t.run(async (ctx) => {
      return await ctx.db
        .query('tags')
        .withIndex('by_slug', (q) => q.eq('slug', 'python'))
        .unique();
    });
    await t.mutation(internal.tags.internal.archive, {
      id: tag!._id,
      actorId: adminId,
    });

    // Should be hidden from public list
    tags = await t.query(api.tags.queries.list, {});
    expect(tags.some((t) => t.slug === 'python')).toBe(false);
  });

  it('restore_makesTagVisibleAgain', async () => {
    const t = convexTest(schema, modules);
    const adminId = await seedAdminUser(t);

    await t.mutation(internal.tags.internal.create, {
      name: 'Rust',
      slug: 'rust',
    });

    const tag = await t.run(async (ctx) => {
      return await ctx.db
        .query('tags')
        .withIndex('by_slug', (q) => q.eq('slug', 'rust'))
        .unique();
    });

    // Archive then restore
    await t.mutation(internal.tags.internal.archive, {
      id: tag!._id,
      actorId: adminId,
    });
    await t.mutation(internal.tags.internal.restore, { id: tag!._id });

    const tags = await t.query(api.tags.queries.list, {});
    expect(tags.some((t) => t.slug === 'rust')).toBe(true);
  });

  it('archivedTag_filteredFromPublicArticleResponse', async () => {
    const t = convexTest(schema, modules);
    const adminId = await seedAdminUser(t);

    await t.mutation(internal.tags.internal.create, {
      name: 'Go',
      slug: 'go',
    });
    await t.mutation(internal.tags.internal.create, {
      name: 'TypeScript',
      slug: 'typescript',
    });

    await t.mutation(api.articles.admin.create, {
      title: 'Multi Tag',
      slug: 'multi-tag',
      content: 'c',
      excerpt: 'e',
      tags: ['go', 'typescript'],
      status: 'published',
      publishedAt: Date.now() - 1000,
    });

    // Archive 'go' tag
    const goTag = await t.run(async (ctx) => {
      return await ctx.db
        .query('tags')
        .withIndex('by_slug', (q) => q.eq('slug', 'go'))
        .unique();
    });
    await t.mutation(internal.tags.internal.archive, {
      id: goTag!._id,
      actorId: adminId,
    });

    // Public query should filter out 'go' from article tags
    const article = await t.query(api.articles.queries.getBySlug, {
      slug: 'multi-tag',
    });
    expect(article).not.toBeNull();
    expect(article!.tags).toEqual(['typescript']);
    expect(article!.tags).not.toContain('go');
  });

  it('listArchived_returnsOnlyArchivedTags', async () => {
    const t = convexTest(schema, modules);
    const adminId = await seedAdminUser(t);

    await t.mutation(internal.tags.internal.create, {
      name: 'Active',
      slug: 'active',
    });
    await t.mutation(internal.tags.internal.create, {
      name: 'Archived',
      slug: 'archived',
    });

    const archivedTag = await t.run(async (ctx) => {
      return await ctx.db
        .query('tags')
        .withIndex('by_slug', (q) => q.eq('slug', 'archived'))
        .unique();
    });
    await t.mutation(internal.tags.internal.archive, {
      id: archivedTag!._id,
      actorId: adminId,
    });

    const archived = await t.query(internal.tags.internal.listArchived, {});
    expect(archived.some((t) => t.slug === 'archived')).toBe(true);
    expect(archived.some((t) => t.slug === 'active')).toBe(false);
  });
});
