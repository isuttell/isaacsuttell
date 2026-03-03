import { v, ConvexError } from 'convex/values';
import { mutation } from '../_generated/server';
import { requireAdmin } from '../lib/auth';
import { validateSlug } from '../lib/validators';
import { internal } from '../_generated/api';

export const create = mutation({
  args: { name: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    validateSlug(args.slug);

    const existing = await ctx.db
      .query('tags')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (existing) throw new ConvexError('Tag slug already exists');

    return await ctx.db.insert('tags', args);
  },
});

export const remove = mutation({
  args: { id: v.id('tags') },
  handler: async (ctx, args) => {
    const actorId = await requireAdmin(ctx);
    await ctx.runMutation(internal.tags.internal.archive, {
      id: args.id,
      actorId,
    });
  },
});
