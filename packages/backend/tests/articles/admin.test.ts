import { convexTest } from 'convex-test';
import { expect, describe, it, vi } from 'vitest';
import schema from '../../convex/schema';
import { modules } from '../test_setup';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

// Mock getAuthUserId — convex-test doesn't integrate with @convex-dev/auth sessions
let mockUserId: Id<'users'> | null = null;

vi.mock('@convex-dev/auth/server', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getAuthUserId: async () => mockUserId,
  };
});

describe('articles.admin', () => {
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

  async function seedRegularUser(t: ReturnType<typeof convexTest>) {
    const id = await t.run(async (ctx) => {
      return await ctx.db.insert('users', {
        name: 'User',
        email: 'user@test.com',
      });
    });
    mockUserId = id;
    return id;
  }

  it('create_withAdmin_insertsArticle', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'My Post',
      slug: 'my-post',
      content: '# Hello',
      excerpt: 'A post',
      tags: ['test'],
      status: 'draft',
    });

    expect(id).toBeDefined();

    const article = await t.query(api.articles.admin.getById, { id });
    expect(article).not.toBeNull();
    expect(article!.title).toBe('My Post');
    expect(article!.status).toBe('draft');
  });

  it('create_requiresPublishedAt_whenPublished', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    await expect(
      t.mutation(api.articles.admin.create, {
        title: 'Bad Post',
        slug: 'bad-post',
        content: '# Nope',
        excerpt: 'Nope',
        tags: [],
        status: 'published',
      })
    ).rejects.toThrowError();
  });

  it('create_rejectsDuplicateSlug', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    await t.mutation(api.articles.admin.create, {
      title: 'First',
      slug: 'same-slug',
      content: 'content',
      excerpt: 'excerpt',
      tags: [],
      status: 'draft',
    });

    await expect(
      t.mutation(api.articles.admin.create, {
        title: 'Second',
        slug: 'same-slug',
        content: 'content',
        excerpt: 'excerpt',
        tags: [],
        status: 'draft',
      })
    ).rejects.toThrowError();
  });

  it('create_rejectsInvalidSlug', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    await expect(
      t.mutation(api.articles.admin.create, {
        title: 'Bad',
        slug: 'UPPERCASE',
        content: 'c',
        excerpt: 'e',
        tags: [],
        status: 'draft',
      })
    ).rejects.toThrowError();

    await expect(
      t.mutation(api.articles.admin.create, {
        title: 'Bad',
        slug: 'has spaces',
        content: 'c',
        excerpt: 'e',
        tags: [],
        status: 'draft',
      })
    ).rejects.toThrowError();
  });

  it('create_unauthenticated_throws', async () => {
    const t = convexTest(schema, modules);
    mockUserId = null;

    await expect(
      t.mutation(api.articles.admin.create, {
        title: 'Anon Post',
        slug: 'anon',
        content: 'content',
        excerpt: 'excerpt',
        tags: [],
        status: 'draft',
      })
    ).rejects.toThrowError();
  });

  it('update_changesFields', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'Original',
      slug: 'original',
      content: 'old content',
      excerpt: 'old',
      tags: [],
      status: 'draft',
    });

    await t.mutation(api.articles.admin.update, {
      id,
      title: 'Updated',
      status: 'published',
      publishedAt: Date.now(),
    });

    const article = await t.query(api.articles.admin.getById, { id });
    expect(article!.title).toBe('Updated');
    expect(article!.status).toBe('published');
    expect(article!.slug).toBe('original');
  });

  it('remove_deletesArticle', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'To Delete',
      slug: 'to-delete',
      content: 'content',
      excerpt: 'excerpt',
      tags: [],
      status: 'draft',
    });

    await t.mutation(api.articles.admin.remove, { id });

    const article = await t.query(api.articles.admin.getById, { id });
    expect(article).toBeNull();
  });

  it('update_rejectsPublishedWithoutPublishedAt', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'Draft',
      slug: 'draft-post',
      content: 'c',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    await expect(
      t.mutation(api.articles.admin.update, { id, status: 'published' })
    ).rejects.toThrowError();
  });

  it('listAll_nonAdmin_returnsEmpty', async () => {
    const t = convexTest(schema, modules);
    const adminId = await t.run(async (ctx) => {
      return await ctx.db.insert('users', { name: 'Writer', role: 'admin' });
    });
    await t.run(async (ctx) => {
      await ctx.db.insert('articles', {
        title: 'Secret',
        slug: 'secret',
        content: 'content',
        excerpt: 'excerpt',
        tags: [],
        status: 'draft',
        authorId: adminId,
        updatedAt: Date.now(),
      });
    });

    // Set mock to a non-admin user
    await seedRegularUser(t);

    const result = await t.query(api.articles.admin.listAll, {
      paginationOpts: { numItems: 25, cursor: null },
    });
    expect(result.page).toHaveLength(0);
  });
});
