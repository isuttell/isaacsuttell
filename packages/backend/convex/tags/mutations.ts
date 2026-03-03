import { v, ConvexError } from 'convex/values';
import { mutation } from '../_generated/server';
import { requireAdmin } from '../lib/auth';
import { validateSlug } from '../lib/validators';

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
    await requireAdmin(ctx);

    const tag = await ctx.db.get(args.id);
    if (!tag) throw new ConvexError('Tag not found');

    const articles = await ctx.db.query('articles').collect();
    for (const article of articles) {
      if (article.tags.includes(tag.slug)) {
        await ctx.db.patch(article._id, {
          tags: article.tags.filter((t) => t !== tag.slug),
        });
      }
    }

    await ctx.db.delete(args.id);
  },
});
