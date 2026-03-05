import { convexTest } from 'convex-test';
import { expect, describe, it, vi } from 'vitest';
import { ConvexError } from 'convex/values';
import schema from '../../convex/schema';
import { modules } from '../test_setup';
import { api, internal } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

let mockUserId: Id<'users'> | null = null;

vi.mock('@convex-dev/auth/server', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getAuthUserId: async () => mockUserId,
  };
});

describe('articles optimistic concurrency control', () => {
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

  it('update_succeedsWhenExpectedUpdatedAtMatches', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'OCC Test',
      slug: 'occ-test',
      content: 'initial',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    const article = await t.query(api.articles.admin.getById, { id });
    expect(article).not.toBeNull();
    const updatedAt = article!.updatedAt;

    await t.mutation(api.articles.admin.update, {
      id,
      content: 'updated',
      expectedUpdatedAt: updatedAt,
    });

    const updated = await t.query(api.articles.admin.getById, { id });
    expect(updated!.content).toBe('updated');
  });

  it('update_rejectsWhenExpectedUpdatedAtMismatches', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'Stale Test',
      slug: 'stale-test',
      content: 'v1',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    await t.mutation(api.articles.admin.update, {
      id,
      content: 'v2',
    });

    await expect(
      t.mutation(api.articles.admin.update, {
        id,
        content: 'v3',
        expectedUpdatedAt: 0,
      })
    ).rejects.toThrow(ConvexError);
  });

  it('update_withForceOverwritesDespiteStaleExpectedUpdatedAt', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'Force Test',
      slug: 'force-test',
      content: 'v1',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    await t.mutation(api.articles.admin.update, {
      id,
      content: 'v2',
    });

    await t.mutation(api.articles.admin.update, {
      id,
      content: 'v3',
      expectedUpdatedAt: 0,
      force: true,
    });

    const article = await t.query(api.articles.admin.getById, { id });
    expect(article!.content).toBe('v3');
  });

  it('internal_update_rejectsStaleExpectedUpdatedAt', async () => {
    const t = convexTest(schema, modules);
    const adminId = await seedAdminUser(t);

    const id = await t.mutation(internal.articles.internal.create, {
      title: 'Internal Stale',
      slug: 'internal-stale',
      content: 'v1',
      excerpt: 'e',
      tags: [],
      status: 'draft',
      authorId: adminId,
    });

    await t.mutation(internal.articles.internal.update, {
      id,
      actorId: adminId,
      content: 'v2',
    });

    await expect(
      t.mutation(internal.articles.internal.update, {
        id,
        actorId: adminId,
        content: 'v3',
        expectedUpdatedAt: 0,
      })
    ).rejects.toThrow(ConvexError);
  });

  it('internal_update_withForceOverwrites', async () => {
    const t = convexTest(schema, modules);
    const adminId = await seedAdminUser(t);

    const id = await t.mutation(internal.articles.internal.create, {
      title: 'Internal Force',
      slug: 'internal-force',
      content: 'v1',
      excerpt: 'e',
      tags: [],
      status: 'draft',
      authorId: adminId,
    });

    await t.mutation(internal.articles.internal.update, {
      id,
      actorId: adminId,
      content: 'v2',
    });

    await t.mutation(internal.articles.internal.update, {
      id,
      actorId: adminId,
      content: 'v3',
      expectedUpdatedAt: 0,
      force: true,
    });

    const article = await t.query(internal.articles.internal.getById, { id });
    expect(article!.content).toBe('v3');
  });

  it('update_withoutExpectedUpdatedAtSucceeds', async () => {
    const t = convexTest(schema, modules);
    await seedAdminUser(t);

    const id = await t.mutation(api.articles.admin.create, {
      title: 'No OCC',
      slug: 'no-occ',
      content: 'v1',
      excerpt: 'e',
      tags: [],
      status: 'draft',
    });

    await t.mutation(api.articles.admin.update, {
      id,
      content: 'v2',
    });

    const article = await t.query(api.articles.admin.getById, { id });
    expect(article!.content).toBe('v2');
  });
});
