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

describe('articles versioning and soft delete', () => {
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

  it('create_capturesInitialRevision', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'Versioned Post',
      slug: 'versioned-post',
      content: '# Initial',
      excerpt: 'Initial',
      tags: [],
      status: 'draft',
    });

    const versions = await t.query(internal.articles.internal.listVersions, {
      articleId: id,
      limit: 10,
    });
    expect(versions).toHaveLength(1);
    expect(versions[0].version).toBe(1);
    expect(versions[0].snapshot.title).toBe('Versioned Post');
    expect(versions[0].snapshot.content).toBe('# Initial');
  });

  it('update_capturesRevision', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'Original',
      slug: 'original',
      content: 'v1',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    await t.mutation(api.articles.admin.update, {
      id,
      title: 'Updated',
      content: 'v2',
    });

    const versions = await t.query(internal.articles.internal.listVersions, {
      articleId: id,
      limit: 10,
    });
    expect(versions.length).toBeGreaterThanOrEqual(2);
    expect(versions[0].snapshot.title).toBe('Original');
    expect(versions[0].snapshot.content).toBe('v1');
    const article = await t.query(api.articles.admin.getById, { id });
    expect(article!.title).toBe('Updated');
    expect(article!.content).toBe('v2');
  });

  it('remove_archivesArticle', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'To Archive',
      slug: 'to-archive',
      content: 'c',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    await t.mutation(api.articles.admin.remove, { id });

    const article = await t.query(api.articles.admin.getById, { id });
    expect(article).toBeNull();

    const articleWithArchived = await t.query(internal.articles.internal.getById, {
      id,
      includeArchived: true,
    });
    expect(articleWithArchived).not.toBeNull();
    expect(articleWithArchived!.deletedAt).toBeDefined();
  });

  it('restore_unarchivesArticle', async () => {
    const t = convexTest(schema, modules);
    const adminId = await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'Restore Me',
      slug: 'restore-me',
      content: 'c',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    await t.mutation(internal.articles.internal.archive, {
      id,
      actorId: adminId,
    });

    let article = await t.query(api.articles.admin.getById, { id });
    expect(article).toBeNull();

    await t.mutation(internal.articles.internal.restore, { id });

    article = await t.query(api.articles.admin.getById, { id });
    expect(article).not.toBeNull();
    expect(article!.title).toBe('Restore Me');
  });

  it('restoreVersion_revertsContent', async () => {
    const t = convexTest(schema, modules);
    const adminId = await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'V1',
      slug: 'v1-post',
      content: 'content v1',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    await t.mutation(api.articles.admin.update, {
      id,
      title: 'V2',
      content: 'content v2',
    });

    const versions = await t.query(internal.articles.internal.listVersions, {
      articleId: id,
      limit: 10,
    });
    const v1 = versions.find((x) => x.snapshot.content === 'content v1');
    expect(v1).toBeDefined();

    await t.mutation(internal.articles.internal.restoreVersion, {
      articleId: id,
      version: v1!.version,
      actorId: adminId,
    });

    const article = await t.query(api.articles.admin.getById, { id });
    expect(article!.title).toBe('V1');
    expect(article!.content).toBe('content v1');
  });

  it('getVersion_returnsFullSnapshot', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'Full Snapshot',
      slug: 'full-snapshot',
      content: 'full content here',
      excerpt: 'excerpt',
      tags: [],
      status: 'draft',
    });

    const versionDoc = await t.query(internal.articles.internal.getVersion, {
      articleId: id,
      version: 1,
    });
    expect(versionDoc).not.toBeNull();
    expect(versionDoc!.snapshot.content).toBe('full content here');
    expect(versionDoc!.snapshot.title).toBe('Full Snapshot');
  });

  it('update_rejectsStaleExpectedUpdatedAt', async () => {
    const t = convexTest(schema, modules);
    const adminId = await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'Optimistic',
      slug: 'optimistic',
      content: 'c',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    // First update succeeds
    await t.mutation(internal.articles.internal.update, {
      id,
      actorId: adminId,
      title: 'Updated Once',
    });

    // Stale expectedUpdatedAt should fail
    await expect(
      t.mutation(internal.articles.internal.update, {
        id,
        actorId: adminId,
        title: 'Stale Update',
        expectedUpdatedAt: 0,
      })
    ).rejects.toThrow('modified since last read');
  });

  it('adminListVersions_requiresAuth', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'Auth Test',
      slug: 'auth-test',
      content: 'c',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    // Should work as admin
    const versions = await t.query(api.articles.admin.listVersions, {
      articleId: id,
    });
    expect(versions.length).toBeGreaterThan(0);

    // Should return empty as non-admin
    mockUserId = null;
    const empty = await t.query(api.articles.admin.listVersions, {
      articleId: id,
    });
    expect(empty).toHaveLength(0);
  });
});
