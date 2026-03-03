import { v, ConvexError } from 'convex/values';
import { internalQuery, internalMutation } from '../_generated/server';
import { validateSlug } from '../lib/validators';

function isActiveTag<T extends { deletedAt?: number }>(t: T): boolean {
  return t.deletedAt === undefined;
}

export const list = internalQuery({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const tags = await ctx.db.query('tags').collect();
    return args.includeArchived ? tags : tags.filter(isActiveTag);
  },
});

export const listArchived = internalQuery({
  args: {},
  handler: async (ctx) => {
    const tags = await ctx.db
      .query('tags')
      .withIndex('by_deletedAt', (q) => q.gte('deletedAt', 0))
      .collect();
    return tags;
  },
});

export const create = internalMutation({
  args: { name: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    validateSlug(args.slug);

    const existing = await ctx.db
      .query('tags')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (existing) throw new ConvexError('Tag slug already exists');

    return await ctx.db.insert('tags', args);
  },
});

export const archive = internalMutation({
  args: { id: v.id('tags'), actorId: v.id('users') },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.id);
    if (!tag) throw new ConvexError('Tag not found');
    if (!isActiveTag(tag)) throw new ConvexError('Tag is already archived');

    // Non-destructive: articles keep the tag slug in their tags array.
    // Archived tags are filtered out at query time instead.
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      deletedBy: args.actorId,
    });
  },
});

export const restore = internalMutation({
  args: { id: v.id('tags') },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.id);
    if (!tag) throw new ConvexError('Tag not found');
    if (isActiveTag(tag)) throw new ConvexError('Tag is not archived');

    await ctx.db.patch(args.id, {
      deletedAt: undefined,
      deletedBy: undefined,
    });
  },
});
